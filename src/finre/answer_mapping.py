"""Map raw onboarding answers to normalized assessment input."""

from __future__ import annotations

from typing import Any, Mapping

from finre.scoring import FinancialProfile


REQUIRED_ANSWER_KEYS: tuple[str, ...] = (
    "q07",
    "q13",
    "q14",
    "q15",
    "q16",
    "q17",
    "q18",
    "q19",
    "q20",
    "q25",
    "q26",
    "q30",
    "q34",
    "q36",
    "q38",
)


class AssessmentInputError(ValueError):
    """Raised when raw answer set cannot build an assessment profile."""


def build_profile_from_answers(answers: Mapping[str, Any]) -> FinancialProfile:
    """Convert raw answer map from wizard into FinancialProfile."""

    missing_keys: list[str] = [
        key for key in REQUIRED_ANSWER_KEYS if key not in answers
    ]
    if missing_keys:
        missing_str: str = ", ".join(missing_keys)
        raise AssessmentInputError(f"missing required answers: {missing_str}")

    monthly_total_expense: float = (
        _as_number(answers.get("q13"))
        + _as_number(answers.get("q14"))
        + _as_number(answers.get("q15"))
        + _as_number(answers.get("q16"))
        + _as_number(answers.get("q17"))
        + _as_number(answers.get("q18"))
        + _as_number(answers.get("q19"))
    )

    return FinancialProfile(
        monthly_net_income=_as_number(answers.get("q07")),
        monthly_total_expense=monthly_total_expense,
        monthly_debt_payment=_as_number(answers.get("q25")),
        emergency_fund_months=_as_number(answers.get("q30")),
        had_recent_payment_delay=_normalize_text(answers.get("q26")) == "evet",
        goal_is_clear=len(str(answers.get("q34", "")).strip()) >= 8,
        has_goal_date=_normalize_text(answers.get("q36")) == "evet",
        has_monthly_saving_habit=_normalize_text(answers.get("q20"))
        in {"her ay", "bazi aylar"},
        tracks_expenses=_normalize_text(answers.get("q38")) == "planli",
    )


def _as_number(value: Any) -> float:
    """Coerce value to non-negative float."""

    try:
        parsed: float = float(value)
    except (TypeError, ValueError):
        return 0.0

    if parsed < 0:
        return 0.0

    return parsed


def _normalize_text(value: Any) -> str:
    """Normalize text for robust comparisons."""

    normalized: str = str(value or "").strip().lower()
    return (
        normalized.replace("\u0131", "i")
        .replace("\u011f", "g")
        .replace("\u015f", "s")
        .replace("\u00fc", "u")
        .replace("\u00f6", "o")
        .replace("\u00e7", "c")
    )
