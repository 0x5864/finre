"""HTTP API for Finre MVP."""

from __future__ import annotations

import json
import os
import time
from dataclasses import asdict
from pathlib import Path
from typing import Any

from finre.answer_mapping import AssessmentInputError, build_profile_from_answers
from finre.assessment import run_assessment
from finre.gold_prices import (
    GoldPriceFetchError,
    GoldPriceRow,
    export_gold_rows,
    fetch_gold_prices,
)
from finre.kapali_carsi_prices import (
    FxPriceRow,
    MarketPriceFetchError,
    export_market_rows,
    fetch_kapali_carsi_fx_prices,
)
from finre.question_bank import load_question_bank
from finre.scoring import FinancialProfile
from finre.stock_summary import (
    StockSummaryFetchError,
    StockSummaryTable,
    export_stock_summary_tables,
    fetch_stock_summary_tables,
)
from finre.storage import create_session, get_session, init_storage, save_answers
from finre.tefas import (
    TefasFetchError,
    extract_tefas_returns_map,
    enrich_tefas_rows_with_returns,
    fetch_tefas_comparison_fee_rows,
    fetch_tefas_comparison_return_rows,
    fetch_tefas_comparison_rows,
    fetch_tefas_comparison_size_rows,
    fetch_tefas_rows,
    normalize_tefas_rows,
)

try:
    from fastapi import FastAPI, HTTPException, Query
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
except ImportError as import_error:  # pragma: no cover - dependency guard
    _IMPORT_ERROR: Exception | None = import_error
    FastAPI = None  # type: ignore[assignment]
    HTTPException = Exception  # type: ignore[assignment]
    BaseModel = object  # type: ignore[assignment]
    Field = None  # type: ignore[assignment]
    CORSMiddleware = None  # type: ignore[assignment]
    Query = None  # type: ignore[assignment]
else:
    _IMPORT_ERROR = None


DISCLAIMER_TEXT: str = (
    "Bu cikti bilgi amaclidir ve yatirim tavsiyesi degildir."
)
TEFAS_DEFAULT_LIMIT: int = 12
TEFAS_MAX_LIMIT: int = 100
TEFAS_RETURN_ENRICH_LIMIT: int = 24
MARKET_DEFAULT_LIMIT: int = 50


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


    class TefasFundItemResponse(BaseModel):
        """One normalized TEFAS fund row."""

        fon_kodu: str
        fon_unvani: str
        fiyat: float
        portfoy_buyuklugu: float
        bir_aylik_getiri: float | None = None
        bir_yillik_getiri: float | None = None


    class TefasFundsResponse(BaseModel):
        """TEFAS fund list payload with source metadata."""

        source: str
        fetched_at_unix: int
        count: int
        funds: list[TefasFundItemResponse]


    class TefasComparisonFundsResponse(BaseModel):
        """Combined TEFAS comparison payload for return, fee, and size tables."""

        source: str
        fetched_at_unix: int
        return_count: int
        fee_count: int
        size_count: int
        return_rows: list[dict[str, Any]]
        fee_rows: list[dict[str, Any]]
        size_rows: list[dict[str, Any]]


    class GoldPriceItemResponse(BaseModel):
        """One normalized gold market row."""

        kaynak: str
        altin_adi: str
        alis_fiyati: float
        satis_fiyati: float
        gunluk_degisim_yuzde: float | None = None
        guncellenme_tarihi: str | None = None


    class GoldPricesResponse(BaseModel):
        """Gold market payload with source metadata."""

        kaynak: str
        fetched_at_utc: str | None = None
        count: int
        rows: list[GoldPriceItemResponse]


    class FxPriceItemResponse(BaseModel):
        """One normalized FX market row."""

        kaynak: str
        doviz_adi: str
        alis_fiyati: float
        satis_fiyati: float
        gunluk_degisim_yuzde: float | None = None
        gunluk_degisim_tutari: float | None = None
        guncellenme_tarihi: str | None = None


    class FxPricesResponse(BaseModel):
        """FX market payload with source metadata."""

        kaynak: str
        fetched_at_utc: str | None = None
        count: int
        rows: list[FxPriceItemResponse]


    class StockSummaryRowResponse(BaseModel):
        """One stock summary table row."""

        cells: list[str]


    class StockSummaryTableResponse(BaseModel):
        """One stock summary table block."""

        title: str
        columns: list[str]
        rows: list[StockSummaryRowResponse]


    class StockSummaryResponse(BaseModel):
        """Stock summary payload with source metadata."""

        source: str
        kaynak: str
        fetched_at_utc: str | None = None
        count: int
        tables: list[StockSummaryTableResponse]


def _tefas_cache_ttl_seconds() -> int:
    """Return TEFAS cache TTL from env with safe defaults."""

    raw_value: str = os.getenv("FINRE_TEFAS_CACHE_TTL_SECONDS", "3600")
    try:
        ttl: int = int(raw_value)
    except ValueError:
        return 3600
    return max(60, ttl)


def _market_cache_ttl_seconds() -> int:
    """Return market cache TTL from env with safe defaults."""

    raw_value: str = os.getenv("FINRE_MARKET_CACHE_TTL_SECONDS", "60")
    try:
        ttl: int = int(raw_value)
    except ValueError:
        return 60
    return max(15, ttl)


def _tefas_fallback_path() -> Path:
    """Return local TEFAS snapshot path used when remote call fails."""

    return Path(__file__).resolve().parents[2] / "data" / "tefas_top12_2026-03-12.json"


def _tefas_comparison_snapshot_path(file_name: str) -> Path:
    """Return one TEFAS comparison snapshot path."""

    return Path(__file__).resolve().parents[2] / "data" / file_name


def _market_fallback_path(file_name: str) -> Path:
    """Return one local market snapshot path."""

    return Path(__file__).resolve().parents[2] / "data" / file_name


def _market_output_dir() -> Path:
    """Return local market snapshot output directory."""

    return Path(__file__).resolve().parents[2] / "data"


def _persist_gold_snapshot(*, live_rows: list[GoldPriceRow]) -> None:
    """Write local gold snapshot files from live rows."""

    export_gold_rows(rows=live_rows, output_dir=_market_output_dir())


def _persist_fx_snapshot(*, live_rows: list[FxPriceRow]) -> None:
    """Write local FX snapshot files from live rows."""

    export_market_rows(
        rows=live_rows,
        output_dir=_market_output_dir(),
        file_prefix="doviz_kapali_carsi",
    )


def _persist_stock_snapshot(*, live_tables: list[StockSummaryTable]) -> None:
    """Write local stock summary snapshot files from parsed tables."""

    export_stock_summary_tables(
        tables=live_tables,
        output_dir=_market_output_dir(),
    )


def _persist_tefas_comparison_snapshot(
    *,
    file_name: str,
    fetched_at_unix: int,
    rows: list[dict[str, Any]],
) -> None:
    """Write one local TEFAS comparison snapshot file."""

    snapshot_path: Path = _tefas_comparison_snapshot_path(file_name)
    payload: dict[str, Any] = {
        "source": "tefas-live",
        "fetched_at_unix": fetched_at_unix,
        "count": len(rows),
        "rows": rows,
    }
    with snapshot_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def _load_local_tefas_snapshot(limit: int) -> list[dict[str, Any]]:
    """Load local TEFAS snapshot and normalize row count."""

    snapshot_path: Path = _tefas_fallback_path()
    if not snapshot_path.exists():
        return []

    try:
        with snapshot_path.open("r", encoding="utf-8") as handle:
            payload: Any = json.load(handle)
    except (OSError, ValueError):
        return []

    if not isinstance(payload, list):
        return []

    safe_limit: int = max(1, min(limit, TEFAS_MAX_LIMIT))
    rows: list[dict[str, Any]] = []
    for raw_row in payload[:safe_limit]:
        if isinstance(raw_row, dict):
            row = dict(raw_row)
            row.setdefault("bir_aylik_getiri", None)
            row.setdefault("bir_yillik_getiri", None)
            rows.append(row)
    return rows


def _load_local_market_snapshot(file_name: str) -> dict[str, Any]:
    """Load one local market snapshot payload if it exists."""

    snapshot_path: Path = _market_fallback_path(file_name)
    if not snapshot_path.exists():
        return {"kaynak": "Kapalı Çarşı", "fetched_at_utc": None, "count": 0, "rows": []}

    try:
        with snapshot_path.open("r", encoding="utf-8") as handle:
            payload: Any = json.load(handle)
    except (OSError, ValueError):
        return {"kaynak": "Kapalı Çarşı", "fetched_at_utc": None, "count": 0, "rows": []}

    if not isinstance(payload, dict):
        return {"kaynak": "Kapalı Çarşı", "fetched_at_utc": None, "count": 0, "rows": []}

    rows: list[dict[str, Any]] = []
    raw_rows: Any = payload.get("rows", [])
    if isinstance(raw_rows, list):
        for raw_row in raw_rows[:MARKET_DEFAULT_LIMIT]:
            if isinstance(raw_row, dict):
                rows.append(dict(raw_row))

    return {
        "kaynak": str(payload.get("kaynak", "Kapalı Çarşı")),
        "fetched_at_utc": (
            str(payload.get("fetched_at_utc"))
            if payload.get("fetched_at_utc") is not None
            else None
        ),
        "count": len(rows),
        "rows": rows,
    }


def _load_local_stock_snapshot(file_name: str) -> dict[str, Any]:
    """Load one local stock summary snapshot payload if it exists."""

    snapshot_path: Path = _market_fallback_path(file_name)
    if not snapshot_path.exists():
        return {"kaynak": "Bigpara", "fetched_at_utc": None, "count": 0, "tables": []}

    try:
        with snapshot_path.open("r", encoding="utf-8") as handle:
            payload: Any = json.load(handle)
    except (OSError, ValueError):
        return {"kaynak": "Bigpara", "fetched_at_utc": None, "count": 0, "tables": []}

    if not isinstance(payload, dict):
        return {"kaynak": "Bigpara", "fetched_at_utc": None, "count": 0, "tables": []}

    tables: list[dict[str, Any]] = []
    raw_tables: Any = payload.get("tables", [])
    if isinstance(raw_tables, list):
        for raw_table in raw_tables:
            if not isinstance(raw_table, dict):
                continue
            columns: list[str] = []
            raw_columns: Any = raw_table.get("columns", [])
            if isinstance(raw_columns, list):
                columns = [str(column) for column in raw_columns]

            rows: list[dict[str, list[str]]] = []
            raw_rows: Any = raw_table.get("rows", [])
            if isinstance(raw_rows, list):
                for raw_row in raw_rows:
                    if isinstance(raw_row, dict):
                        raw_cells: Any = raw_row.get("cells", [])
                        if isinstance(raw_cells, list):
                            rows.append({"cells": [str(cell) for cell in raw_cells]})

            tables.append(
                {
                    "title": str(raw_table.get("title", "")),
                    "columns": columns,
                    "rows": rows,
                }
            )

    return {
        "kaynak": str(payload.get("kaynak", "Bigpara")),
        "fetched_at_utc": (
            str(payload.get("fetched_at_utc"))
            if payload.get("fetched_at_utc") is not None
            else None
        ),
        "count": len(tables),
        "tables": tables,
    }


def _load_local_tefas_comparison_snapshot(file_name: str) -> dict[str, Any]:
    """Load one local TEFAS comparison snapshot payload if it exists."""

    snapshot_path: Path = _tefas_comparison_snapshot_path(file_name)
    if not snapshot_path.exists():
        return {"fetched_at_unix": 0, "count": 0, "rows": []}

    try:
        with snapshot_path.open("r", encoding="utf-8") as handle:
            payload: Any = json.load(handle)
    except (OSError, ValueError):
        return {"fetched_at_unix": 0, "count": 0, "rows": []}

    fetched_at_unix: int = 0
    raw_rows: Any = []
    if isinstance(payload, dict):
        raw_fetched_at: Any = payload.get("fetched_at_unix", 0)
        try:
            fetched_at_unix = int(raw_fetched_at)
        except (TypeError, ValueError):
            fetched_at_unix = 0
        raw_rows = payload.get("rows", payload.get("data", []))

    rows: list[dict[str, Any]] = []
    if isinstance(raw_rows, list):
        for raw_row in raw_rows:
            if isinstance(raw_row, dict):
                rows.append(dict(raw_row))

    return {
        "fetched_at_unix": fetched_at_unix,
        "count": len(rows),
        "rows": rows,
    }


def _build_tefas_comparison_payload(
    *,
    source: str,
    fetched_at_unix: int,
    return_rows: list[dict[str, Any]],
    fee_rows: list[dict[str, Any]],
    size_rows: list[dict[str, Any]],
) -> dict[str, Any]:
    """Build one normalized TEFAS comparison response payload."""

    return {
        "source": source,
        "fetched_at_unix": fetched_at_unix,
        "return_count": len(return_rows),
        "fee_count": len(fee_rows),
        "size_count": len(size_rows),
        "return_rows": return_rows,
        "fee_rows": fee_rows,
        "size_rows": size_rows,
    }


def _has_tefas_comparison_rows(payload: dict[str, Any]) -> bool:
    """Return whether any comparison table has at least one row."""

    raw_return_rows: Any = payload.get("return_rows", [])
    raw_fee_rows: Any = payload.get("fee_rows", [])
    raw_size_rows: Any = payload.get("size_rows", [])
    return bool(raw_return_rows or raw_fee_rows or raw_size_rows)


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
    app.state.tefas_cache = {
        "fetched_at_unix": 0,
        "source": "none",
        "funds": [],
    }
    app.state.tefas_comparison_cache = {
        "fetched_at_unix": 0,
        "payload": _build_tefas_comparison_payload(
            source="none",
            fetched_at_unix=0,
            return_rows=[],
            fee_rows=[],
            size_rows=[],
        ),
    }
    app.state.market_cache = {
        "gold": {
            "fetched_at_unix": 0,
            "payload": {
                "kaynak": "Kapalı Çarşı",
                "fetched_at_utc": None,
                "count": 0,
                "rows": [],
            },
        },
        "fx": {
            "fetched_at_unix": 0,
            "payload": {
                "kaynak": "Kapalı Çarşı",
                "fetched_at_utc": None,
                "count": 0,
                "rows": [],
            },
        },
        "stock": {
            "fetched_at_unix": 0,
            "payload": {
                "source": "none",
                "kaynak": "Bigpara",
                "fetched_at_utc": None,
                "count": 0,
                "tables": [],
            },
        },
    }

    origins_raw: str = os.getenv("FINRE_CORS_ORIGINS", "")
    origins: list[str] = [
        item.strip() for item in origins_raw.split(",") if item.strip()
    ]
    if not origins:
        origins = [
            "http://127.0.0.1:4173",
            "http://localhost:4173",
            "http://127.0.0.1:3000",
            "http://localhost:3000",
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

    @app.get("/api/v1/market/gold", response_model=GoldPricesResponse)
    def market_gold(
        force_refresh: bool = Query(default=False),
    ) -> GoldPricesResponse:
        """Return live gold rows with short-lived in-memory cache."""

        now_unix: int = int(time.time())
        cache_ttl: int = _market_cache_ttl_seconds()
        cache_entry: dict[str, Any] = app.state.market_cache["gold"]
        cached_payload: dict[str, Any] = dict(cache_entry.get("payload", {}))
        cached_rows: list[dict[str, Any]] = []
        raw_cached_rows: Any = cached_payload.get("rows", [])
        if isinstance(raw_cached_rows, list):
            for row in raw_cached_rows:
                if isinstance(row, dict):
                    cached_rows.append(dict(row))

        cache_age_seconds: int = now_unix - int(cache_entry.get("fetched_at_unix", 0))
        should_use_cache: bool = (
            not force_refresh and bool(cached_rows) and cache_age_seconds < cache_ttl
        )
        if should_use_cache:
            return GoldPricesResponse(
                kaynak=str(cached_payload.get("kaynak", "Kapalı Çarşı")),
                fetched_at_utc=(
                    str(cached_payload.get("fetched_at_utc"))
                    if cached_payload.get("fetched_at_utc") is not None
                    else None
                ),
                count=len(cached_rows),
                rows=cached_rows,
            )

        try:
            live_row_objects = fetch_gold_prices()
            try:
                _persist_gold_snapshot(live_rows=live_row_objects)
            except OSError:
                pass

            live_rows: list[dict[str, Any]] = [
                asdict(row) for row in live_row_objects
            ]
            payload: dict[str, Any] = {
                "kaynak": "Kapalı Çarşı",
                "fetched_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "count": len(live_rows),
                "rows": live_rows,
            }
            app.state.market_cache["gold"] = {
                "fetched_at_unix": now_unix,
                "payload": payload,
            }
            return GoldPricesResponse(**payload)
        except GoldPriceFetchError:
            fallback_payload: dict[str, Any] = _load_local_market_snapshot(
                "altin_kapali_carsi_latest.json"
            )
            return GoldPricesResponse(**fallback_payload)

    @app.get("/api/v1/market/fx", response_model=FxPricesResponse)
    def market_fx(
        force_refresh: bool = Query(default=False),
    ) -> FxPricesResponse:
        """Return live FX rows with short-lived in-memory cache."""

        now_unix: int = int(time.time())
        cache_ttl: int = _market_cache_ttl_seconds()
        cache_entry: dict[str, Any] = app.state.market_cache["fx"]
        cached_payload: dict[str, Any] = dict(cache_entry.get("payload", {}))
        cached_rows: list[dict[str, Any]] = []
        raw_cached_rows: Any = cached_payload.get("rows", [])
        if isinstance(raw_cached_rows, list):
            for row in raw_cached_rows:
                if isinstance(row, dict):
                    cached_rows.append(dict(row))

        cache_age_seconds: int = now_unix - int(cache_entry.get("fetched_at_unix", 0))
        should_use_cache: bool = (
            not force_refresh and bool(cached_rows) and cache_age_seconds < cache_ttl
        )
        if should_use_cache:
            return FxPricesResponse(
                kaynak=str(cached_payload.get("kaynak", "Kapalı Çarşı")),
                fetched_at_utc=(
                    str(cached_payload.get("fetched_at_utc"))
                    if cached_payload.get("fetched_at_utc") is not None
                    else None
                ),
                count=len(cached_rows),
                rows=cached_rows,
            )

        try:
            live_row_objects = fetch_kapali_carsi_fx_prices()
            try:
                _persist_fx_snapshot(live_rows=live_row_objects)
            except OSError:
                pass

            live_rows: list[dict[str, Any]] = [
                asdict(row) for row in live_row_objects
            ]
            payload: dict[str, Any] = {
                "kaynak": "Kapalı Çarşı",
                "fetched_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "count": len(live_rows),
                "rows": live_rows,
            }
            app.state.market_cache["fx"] = {
                "fetched_at_unix": now_unix,
                "payload": payload,
            }
            return FxPricesResponse(**payload)
        except MarketPriceFetchError:
            fallback_payload: dict[str, Any] = _load_local_market_snapshot(
                "doviz_kapali_carsi_latest.json"
            )
            return FxPricesResponse(**fallback_payload)

    @app.get("/api/v1/market/stocks/summary", response_model=StockSummaryResponse)
    def market_stock_summary(
        force_refresh: bool = Query(default=False),
    ) -> StockSummaryResponse:
        """Return Bigpara stock summary tables with short-lived in-memory cache."""

        now_unix: int = int(time.time())
        cache_ttl: int = _market_cache_ttl_seconds()
        cache_entry: dict[str, Any] = app.state.market_cache["stock"]
        cached_payload: dict[str, Any] = dict(cache_entry.get("payload", {}))
        cached_tables: list[dict[str, Any]] = []
        raw_cached_tables: Any = cached_payload.get("tables", [])
        if isinstance(raw_cached_tables, list):
            for table in raw_cached_tables:
                if isinstance(table, dict):
                    cached_tables.append(dict(table))

        cache_age_seconds: int = now_unix - int(cache_entry.get("fetched_at_unix", 0))
        should_use_cache: bool = (
            not force_refresh and bool(cached_tables) and cache_age_seconds < cache_ttl
        )
        if should_use_cache:
            return StockSummaryResponse(
                source=str(cached_payload.get("source", "cache")),
                kaynak=str(cached_payload.get("kaynak", "Bigpara")),
                fetched_at_utc=(
                    str(cached_payload.get("fetched_at_utc"))
                    if cached_payload.get("fetched_at_utc") is not None
                    else None
                ),
                count=len(cached_tables),
                tables=cached_tables,
            )

        try:
            live_table_objects: list[StockSummaryTable] = fetch_stock_summary_tables()
            try:
                _persist_stock_snapshot(live_tables=live_table_objects)
            except OSError:
                pass

            live_tables: list[dict[str, Any]] = [asdict(table) for table in live_table_objects]
            payload: dict[str, Any] = {
                "source": "live",
                "kaynak": "Bigpara",
                "fetched_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "count": len(live_tables),
                "tables": live_tables,
            }
            app.state.market_cache["stock"] = {
                "fetched_at_unix": now_unix,
                "payload": payload,
            }
            return StockSummaryResponse(**payload)
        except StockSummaryFetchError:
            if cached_tables:
                return StockSummaryResponse(
                    source="cache-stale",
                    kaynak=str(cached_payload.get("kaynak", "Bigpara")),
                    fetched_at_utc=(
                        str(cached_payload.get("fetched_at_utc"))
                        if cached_payload.get("fetched_at_utc") is not None
                        else None
                    ),
                    count=len(cached_tables),
                    tables=cached_tables,
                )

            fallback_payload: dict[str, Any] = _load_local_stock_snapshot(
                "borsa_bigpara_gunun_ozeti_latest.json"
            )
            fallback_payload["source"] = "local-fallback"
            return StockSummaryResponse(**fallback_payload)

    @app.get("/api/v1/tefas/funds", response_model=TefasFundsResponse)
    def tefas_funds(
        limit: int = Query(default=TEFAS_DEFAULT_LIMIT, ge=1, le=TEFAS_MAX_LIMIT),
        force_refresh: bool = Query(default=False),
    ) -> TefasFundsResponse:
        """Return TEFAS fund rows with in-memory cache for automatic refresh."""

        now_unix: int = int(time.time())
        cache_ttl: int = _tefas_cache_ttl_seconds()
        cached: dict[str, Any] = app.state.tefas_cache

        cached_funds: list[dict[str, Any]] = []
        raw_cached_funds: Any = cached.get("funds", [])
        if isinstance(raw_cached_funds, list):
            for row in raw_cached_funds:
                if isinstance(row, dict):
                    cached_funds.append(row)

        cache_age_seconds: int = now_unix - int(cached.get("fetched_at_unix", 0))
        should_use_cache: bool = (
            not force_refresh and bool(cached_funds) and cache_age_seconds < cache_ttl
        )
        if should_use_cache:
            selected: list[dict[str, Any]] = cached_funds[:limit]
            return TefasFundsResponse(
                source=str(cached.get("source", "cache")),
                fetched_at_unix=int(cached.get("fetched_at_unix", now_unix)),
                count=len(selected),
                funds=selected,
            )

        try:
            remote_rows: list[dict[str, Any]] = fetch_tefas_rows()
            normalized_rows: list[dict[str, Any]] = normalize_tefas_rows(
                rows=remote_rows,
                limit=TEFAS_MAX_LIMIT,
            )

            comparison_returns_map: dict[str, tuple[float | None, float | None]] = {}
            try:
                comparison_rows: list[dict[str, Any]] = fetch_tefas_comparison_rows()
                comparison_returns_map = extract_tefas_returns_map(rows=comparison_rows)
            except TefasFetchError:
                comparison_returns_map = {}

            for row in normalized_rows:
                fund_code: str = str(row.get("fon_kodu", "")).strip()
                if fund_code == "":
                    continue
                mapped_returns: tuple[float | None, float | None] | None = (
                    comparison_returns_map.get(fund_code)
                )
                if mapped_returns is None:
                    continue

                one_month_return, one_year_return = mapped_returns
                if one_month_return is not None:
                    row["bir_aylik_getiri"] = one_month_return
                if one_year_return is not None:
                    row["bir_yillik_getiri"] = one_year_return

            rows_for_enrichment: list[dict[str, Any]] = []
            rows_for_enrichment_index: list[int] = []
            for index, row in enumerate(normalized_rows[:TEFAS_RETURN_ENRICH_LIMIT]):
                if (
                    row.get("bir_aylik_getiri") is None
                    and row.get("bir_yillik_getiri") is None
                ):
                    rows_for_enrichment.append(row)
                    rows_for_enrichment_index.append(index)

            if rows_for_enrichment:
                enriched_rows: list[dict[str, Any]] = enrich_tefas_rows_with_returns(
                    rows=rows_for_enrichment,
                    timeout_seconds=8.0,
                )
                for index, row in enumerate(enriched_rows):
                    normalized_rows[rows_for_enrichment_index[index]] = row

            app.state.tefas_cache = {
                "fetched_at_unix": now_unix,
                "source": "tefas-live",
                "funds": normalized_rows,
            }
            selected_rows: list[dict[str, Any]] = normalized_rows[:limit]
            return TefasFundsResponse(
                source="tefas-live",
                fetched_at_unix=now_unix,
                count=len(selected_rows),
                funds=selected_rows,
            )
        except TefasFetchError:
            if cached_funds:
                selected_stale: list[dict[str, Any]] = cached_funds[:limit]
                return TefasFundsResponse(
                    source="cache-stale",
                    fetched_at_unix=int(cached.get("fetched_at_unix", now_unix)),
                    count=len(selected_stale),
                    funds=selected_stale,
                )

            fallback_rows: list[dict[str, Any]] = _load_local_tefas_snapshot(limit=limit)
            if fallback_rows:
                try:
                    comparison_rows = fetch_tefas_comparison_rows()
                    comparison_returns_map = extract_tefas_returns_map(rows=comparison_rows)
                    for row in fallback_rows:
                        fund_code: str = str(row.get("fon_kodu", "")).strip()
                        if fund_code == "":
                            continue
                        mapped_returns = comparison_returns_map.get(fund_code)
                        if mapped_returns is None:
                            continue
                        one_month_return, one_year_return = mapped_returns
                        if one_month_return is not None:
                            row["bir_aylik_getiri"] = one_month_return
                        if one_year_return is not None:
                            row["bir_yillik_getiri"] = one_year_return
                except TefasFetchError:
                    pass

                app.state.tefas_cache = {
                    "fetched_at_unix": now_unix,
                    "source": "local-fallback",
                    "funds": fallback_rows,
                }
                return TefasFundsResponse(
                    source="local-fallback",
                    fetched_at_unix=now_unix,
                    count=len(fallback_rows),
                    funds=fallback_rows,
                )

            raise HTTPException(
                status_code=502,
                detail="TEFAS verisi su anda alinmiyor.",
            )

    @app.get(
        "/api/v1/tefas/comparison-funds",
        response_model=TefasComparisonFundsResponse,
    )
    def tefas_comparison_funds(
        force_refresh: bool = Query(default=False),
    ) -> TefasComparisonFundsResponse:
        """Return combined TEFAS comparison data for normal investment funds."""

        now_unix: int = int(time.time())
        cache_ttl: int = _tefas_cache_ttl_seconds()
        cache_entry: dict[str, Any] = app.state.tefas_comparison_cache
        cached_payload: dict[str, Any] = dict(cache_entry.get("payload", {}))
        cache_age_seconds: int = now_unix - int(cache_entry.get("fetched_at_unix", 0))

        should_use_cache: bool = (
            not force_refresh
            and _has_tefas_comparison_rows(cached_payload)
            and cache_age_seconds < cache_ttl
        )
        if should_use_cache:
            return TefasComparisonFundsResponse(
                **{
                    **cached_payload,
                    "source": "cache",
                }
            )

        try:
            return_rows: list[dict[str, Any]] = fetch_tefas_comparison_return_rows()
            fee_rows: list[dict[str, Any]] = fetch_tefas_comparison_fee_rows()
            size_rows: list[dict[str, Any]] = fetch_tefas_comparison_size_rows()

            try:
                _persist_tefas_comparison_snapshot(
                    file_name="tefas_yat_returns_latest.json",
                    fetched_at_unix=now_unix,
                    rows=return_rows,
                )
                _persist_tefas_comparison_snapshot(
                    file_name="tefas_yat_fees_latest.json",
                    fetched_at_unix=now_unix,
                    rows=fee_rows,
                )
                _persist_tefas_comparison_snapshot(
                    file_name="tefas_yat_sizes_latest.json",
                    fetched_at_unix=now_unix,
                    rows=size_rows,
                )
            except OSError:
                pass

            payload: dict[str, Any] = _build_tefas_comparison_payload(
                source="tefas-live",
                fetched_at_unix=now_unix,
                return_rows=return_rows,
                fee_rows=fee_rows,
                size_rows=size_rows,
            )
            app.state.tefas_comparison_cache = {
                "fetched_at_unix": now_unix,
                "payload": payload,
            }
            return TefasComparisonFundsResponse(**payload)
        except TefasFetchError:
            if _has_tefas_comparison_rows(cached_payload):
                return TefasComparisonFundsResponse(
                    **{
                        **cached_payload,
                        "source": "cache-stale",
                    }
                )

            return_snapshot: dict[str, Any] = _load_local_tefas_comparison_snapshot(
                "tefas_yat_returns_latest.json"
            )
            fee_snapshot: dict[str, Any] = _load_local_tefas_comparison_snapshot(
                "tefas_yat_fees_latest.json"
            )
            size_snapshot: dict[str, Any] = _load_local_tefas_comparison_snapshot(
                "tefas_yat_sizes_latest.json"
            )
            local_payload: dict[str, Any] = _build_tefas_comparison_payload(
                source="local-fallback",
                fetched_at_unix=max(
                    int(return_snapshot.get("fetched_at_unix", 0)),
                    int(fee_snapshot.get("fetched_at_unix", 0)),
                    int(size_snapshot.get("fetched_at_unix", 0)),
                ),
                return_rows=list(return_snapshot.get("rows", [])),
                fee_rows=list(fee_snapshot.get("rows", [])),
                size_rows=list(size_snapshot.get("rows", [])),
            )
            if _has_tefas_comparison_rows(local_payload):
                return TefasComparisonFundsResponse(**local_payload)

            raise HTTPException(
                status_code=502,
                detail="TEFAS karsilastirma verisi su anda alinmiyor.",
            )

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
