"""HTTP API for Finre MVP."""

from __future__ import annotations

import os
from dataclasses import asdict
from typing import Any

from finre.answer_mapping import AssessmentInputError, build_profile_from_answers
from finre.assessment import run_assessment
from finre.question_bank import load_question_bank
from finre.scoring import FinancialProfile
from finre.storage import create_session, get_session, init_storage, save_answers

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
except ImportError as import_error:  # pragma: no cover - dependency guard
    _IMPORT_ERROR: Exception | None = import_error
    FastAPI = None  # type: ignore[assignment]
    HTTPException = Exception  # type: ignore[assignment]
    BaseModel = object  # type: ignore[assignment]
    Field = None  # type: ignore[assignment]
    CORSMiddleware = None  # type: ignore[assignment]
else:
    _IMPORT_ERROR = None


DISCLAIMER_TEXT: str = (
    "Bu cikti bilgi amaclidir ve yatirim tavsiyesi degildir."
)


if FastAPI is not None:

    class AssessmentRequest(BaseModel):
        """Validated assessment payload from client."""

        monthly_net_income: float = Field(ge=0)
        monthly_total_expense: float = Field(ge=0)
        monthly_debt_payment: float = Field(ge=0)
        emergency_fund_months: float = Field(ge=0)
        had_recent_payment_delay: bool
        goal_is_clear: bool
        has_goal_date: bool
        has_monthly_saving_habit: bool
        tracks_expenses: bool


    class HealthResponse(BaseModel):
        """Simple health response model."""

        status: str


    class QuestionsResponse(BaseModel):
        """Question bank response model."""

        count: int
        questions: list[dict[str, Any]]


    class AssessmentResponse(BaseModel):
        """Assessment response model for frontend."""

        scores: dict[str, Any]
        guidance: dict[str, Any]
        disclaimer: str


    class SessionCreateResponse(BaseModel):
        """Created session payload."""

        session_id: str


    class SessionAnswersRequest(BaseModel):
        """Request body for persisting wizard answers."""

        answers: dict[str, Any] = Field(default_factory=dict)


    class SessionAnswersResponse(BaseModel):
        """Response for saved answer set."""

        session_id: str
        saved_keys: int


    class SessionStateResponse(BaseModel):
        """Stored session state payload."""

        session_id: str
        answers: dict[str, Any]
        created_at: str
        updated_at: str


    class SessionAssessmentResponse(BaseModel):
        """Assessment response generated from one stored session."""

        session_id: str
        scores: dict[str, Any]
        guidance: dict[str, Any]
        disclaimer: str


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    if FastAPI is None:
        raise RuntimeError(
            "FastAPI dependencies are missing. Install requirements first."
        ) from _IMPORT_ERROR

    app: FastAPI = FastAPI(
        title="Finre API",
        version="0.1.0",
        description="Bireysel finansal ihtiyac analizi icin MVP API.",
    )
    init_storage()

    origins_raw: str = os.getenv("FINRE_CORS_ORIGINS", "")
    origins: list[str] = [
        item.strip() for item in origins_raw.split(",") if item.strip()
    ]
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=False,
            allow_methods=["GET", "POST", "PUT"],
            allow_headers=["*"],
        )

    @app.middleware("http")
    async def add_security_headers(request: Any, call_next: Any) -> Any:
        """Attach baseline security headers to every API response."""

        response: Any = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
        )
        return response

    @app.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        """Return service health status."""

        return HealthResponse(status="ok")

    @app.get("/api/v1/questions", response_model=QuestionsResponse)
    def questions() -> QuestionsResponse:
        """Return the full question bank for the onboarding wizard."""

        records: list[dict[str, Any]] = load_question_bank()
        return QuestionsResponse(count=len(records), questions=records)

    @app.post("/api/v1/sessions", response_model=SessionCreateResponse)
    def create_session_route() -> SessionCreateResponse:
        """Create one anonymous onboarding session."""

        session_id: str = create_session()
        return SessionCreateResponse(session_id=session_id)

    @app.put(
        "/api/v1/sessions/{session_id}/answers",
        response_model=SessionAnswersResponse,
    )
    def save_session_answers_route(
        session_id: str,
        payload: SessionAnswersRequest,
    ) -> SessionAnswersResponse:
        """Save current answer set for one session."""

        try:
            saved_count: int = save_answers(
                session_id=session_id,
                answers=payload.answers,
            )
        except KeyError as error:
            raise HTTPException(status_code=404, detail="session not found") from error
        except ValueError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

        return SessionAnswersResponse(session_id=session_id, saved_keys=saved_count)

    @app.get("/api/v1/sessions/{session_id}", response_model=SessionStateResponse)
    def get_session_route(session_id: str) -> SessionStateResponse:
        """Return persisted answer state for one session."""

        session = get_session(session_id=session_id)
        if session is None:
            raise HTTPException(status_code=404, detail="session not found")

        return SessionStateResponse(
            session_id=session.session_id,
            answers=session.answers,
            created_at=session.created_at,
            updated_at=session.updated_at,
        )

    @app.post(
        "/api/v1/sessions/{session_id}/assessment",
        response_model=SessionAssessmentResponse,
    )
    def session_assessment_route(session_id: str) -> SessionAssessmentResponse:
        """Create assessment output from stored session answers."""

        session = get_session(session_id=session_id)
        if session is None:
            raise HTTPException(status_code=404, detail="session not found")

        try:
            profile: FinancialProfile = build_profile_from_answers(session.answers)
        except AssessmentInputError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

        result = run_assessment(profile=profile)
        return SessionAssessmentResponse(
            session_id=session_id,
            scores=asdict(result.scores),
            guidance=asdict(result.guidance),
            disclaimer=DISCLAIMER_TEXT,
        )

    @app.post("/api/v1/assessment", response_model=AssessmentResponse)
    def assessment(payload: AssessmentRequest) -> AssessmentResponse:
        """Calculate score and guidance from onboarding answers."""

        if payload.monthly_total_expense > payload.monthly_net_income * 5:
            raise HTTPException(
                status_code=422,
                detail="monthly_total_expense degeri gercekci gorunmuyor.",
            )

        profile: FinancialProfile = FinancialProfile(
            monthly_net_income=payload.monthly_net_income,
            monthly_total_expense=payload.monthly_total_expense,
            monthly_debt_payment=payload.monthly_debt_payment,
            emergency_fund_months=payload.emergency_fund_months,
            had_recent_payment_delay=payload.had_recent_payment_delay,
            goal_is_clear=payload.goal_is_clear,
            has_goal_date=payload.has_goal_date,
            has_monthly_saving_habit=payload.has_monthly_saving_habit,
            tracks_expenses=payload.tracks_expenses,
        )

        result = run_assessment(profile=profile)
        return AssessmentResponse(
            scores=asdict(result.scores),
            guidance=asdict(result.guidance),
            disclaimer=DISCLAIMER_TEXT,
        )

    return app


app: FastAPI | None = create_app() if FastAPI is not None else None
