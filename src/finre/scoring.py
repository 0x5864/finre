"""Core scoring and guidance functions for the Finre MVP."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final


@dataclass(frozen=True)
class FinancialProfile:
    """Normalized financial input used by the scoring engine."""

    monthly_net_income: float
    monthly_total_expense: float
    monthly_debt_payment: float
    emergency_fund_months: float
    had_recent_payment_delay: bool
    goal_is_clear: bool
    has_goal_date: bool
    has_monthly_saving_habit: bool
    tracks_expenses: bool


@dataclass(frozen=True)
class ScoreBreakdown:
    """Scores per dimension and weighted total score."""

    cash_flow: int
    debt_pressure: int
    safety_buffer: int
    goal_discipline: int
    total_score: int


@dataclass(frozen=True)
class GuidanceResult:
    """Action plan output shown on result screens."""

    level: str
    top_priorities: tuple[str, str, str]
    plan_30_days: tuple[str, str, str]
    plan_60_days: tuple[str, str, str]
    plan_90_days: tuple[str, str, str]


CASH_FLOW_WEIGHT: Final[float] = 0.30
DEBT_PRESSURE_WEIGHT: Final[float] = 0.30
SAFETY_BUFFER_WEIGHT: Final[float] = 0.25
GOAL_DISCIPLINE_WEIGHT: Final[float] = 0.15


def calculate_scores(profile: FinancialProfile) -> ScoreBreakdown:
    """Calculate all score dimensions and the weighted total."""

    cash_flow_score: int = _score_cash_flow(
        monthly_net_income=profile.monthly_net_income,
        monthly_total_expense=profile.monthly_total_expense,
    )
    debt_pressure_score: int = _score_debt_pressure(
        monthly_net_income=profile.monthly_net_income,
        monthly_debt_payment=profile.monthly_debt_payment,
        had_recent_payment_delay=profile.had_recent_payment_delay,
    )
    safety_buffer_score: int = _score_safety_buffer(
        emergency_fund_months=profile.emergency_fund_months,
    )
    goal_discipline_score: int = _score_goal_discipline(
        goal_is_clear=profile.goal_is_clear,
        has_goal_date=profile.has_goal_date,
        has_monthly_saving_habit=profile.has_monthly_saving_habit,
        tracks_expenses=profile.tracks_expenses,
    )

    total: float = (
        (cash_flow_score * CASH_FLOW_WEIGHT)
        + (debt_pressure_score * DEBT_PRESSURE_WEIGHT)
        + (safety_buffer_score * SAFETY_BUFFER_WEIGHT)
        + (goal_discipline_score * GOAL_DISCIPLINE_WEIGHT)
    )

    return ScoreBreakdown(
        cash_flow=cash_flow_score,
        debt_pressure=debt_pressure_score,
        safety_buffer=safety_buffer_score,
        goal_discipline=goal_discipline_score,
        total_score=int(round(_clamp(total, 0.0, 100.0))),
    )


def build_guidance(
    profile: FinancialProfile,
    scores: ScoreBreakdown,
) -> GuidanceResult:
    """Build level and concrete steps from profile and scores."""

    level: str = _resolve_level(scores.total_score)
    priorities: list[str] = _resolve_priorities(profile=profile, scores=scores)

    return GuidanceResult(
        level=level,
        top_priorities=(priorities[0], priorities[1], priorities[2]),
        plan_30_days=_resolve_plan_30_days(level=level, scores=scores),
        plan_60_days=_resolve_plan_60_days(level=level, scores=scores),
        plan_90_days=_resolve_plan_90_days(level=level, scores=scores),
    )


def _score_cash_flow(monthly_net_income: float, monthly_total_expense: float) -> int:
    """Score cash flow with the ratio from the MVP matrix."""

    if monthly_net_income <= 0:
        return 0

    ratio: float = (monthly_net_income - monthly_total_expense) / monthly_net_income

    if ratio >= 0.20:
        return 100
    if ratio >= 0.10:
        return 75
    if ratio >= 0.00:
        return 50
    if ratio >= -0.10:
        return 25
    return 0


def _score_debt_pressure(
    monthly_net_income: float,
    monthly_debt_payment: float,
    had_recent_payment_delay: bool,
) -> int:
    """Score debt pressure and apply delay penalty."""

    if monthly_net_income <= 0:
        base: int = 0
    else:
        ratio: float = monthly_debt_payment / monthly_net_income
        if ratio <= 0.10:
            base = 100
        elif ratio <= 0.25:
            base = 75
        elif ratio <= 0.40:
            base = 50
        elif ratio <= 0.55:
            base = 25
        else:
            base = 0

    penalty: int = 15 if had_recent_payment_delay else 0
    return int(_clamp(base - penalty, 0.0, 100.0))


def _score_safety_buffer(emergency_fund_months: float) -> int:
    """Score emergency fund buffer in month units."""

    if emergency_fund_months >= 6:
        return 100
    if emergency_fund_months >= 3:
        return 75
    if emergency_fund_months >= 1:
        return 50
    if emergency_fund_months > 0:
        return 25
    return 0


def _score_goal_discipline(
    goal_is_clear: bool,
    has_goal_date: bool,
    has_monthly_saving_habit: bool,
    tracks_expenses: bool,
) -> int:
    """Score goal clarity and financial discipline."""

    checks: tuple[bool, bool, bool, bool] = (
        goal_is_clear,
        has_goal_date,
        has_monthly_saving_habit,
        tracks_expenses,
    )
    return sum(25 for is_true in checks if is_true)


def _resolve_level(total_score: int) -> str:
    """Map total score to guidance level."""

    if total_score <= 39:
        return "Acil Toparlanma"
    if total_score <= 59:
        return "Denge Kurma"
    if total_score <= 79:
        return "Guclendirme"
    return "Buyume"


def _resolve_priorities(profile: FinancialProfile, scores: ScoreBreakdown) -> list[str]:
    """Pick top three priorities based on weakest areas first."""

    candidates: list[tuple[int, str]] = [
        (
            scores.cash_flow,
            "Aylik gelir-gider farkini pozitife cevir.",
        ),
        (
            scores.debt_pressure,
            "Borclari gelir oranina gore yeniden planla.",
        ),
        (
            scores.safety_buffer,
            "Acil durum fonunu en az 3 aya cikar.",
        ),
        (
            scores.goal_discipline,
            "Net hedef ve tarih belirleyip aylik takip yap.",
        ),
    ]

    if profile.had_recent_payment_delay:
        candidates.append((0, "Geciken odemeleri hemen kapat ve yeni gecikmeyi durdur."))

    ordered_messages: list[str] = [
        message
        for _, message in sorted(candidates, key=lambda item: item[0])
    ]

    unique: list[str] = []
    for message in ordered_messages:
        if message not in unique:
            unique.append(message)
        if len(unique) == 3:
            break

    while len(unique) < 3:
        unique.append("Haftalik butce kontrolu yap.")

    return unique


def _resolve_plan_30_days(level: str, scores: ScoreBreakdown) -> tuple[str, str, str]:
    """Return first 30-day actions."""

    if level == "Acil Toparlanma":
        return (
            "Tum giderleri yaz ve zorunlu olmayan harcamayi azalt.",
            "Asgari odeme yerine borc takvimini netlestir.",
            "Kucuk bir acil durum hesabi ac.",
        )
    if level == "Denge Kurma":
        return (
            "Aylik butce limiti belirle.",
            "Borclari faizine gore sirala.",
            "Her hafta harcama takibi yap.",
        )
    if scores.safety_buffer < 75:
        return (
            "Otomatik birikim talimati baslat.",
            "Acil fon hedefini 3 ay olarak yaz.",
            "Gereksiz abonelikleri iptal et.",
        )

    return (
        "Aylik birikim oranini bir seviye artir.",
        "Hedefleri oncelik sirasina koy.",
        "Yatirim ogrenme listesi olustur.",
    )


def _resolve_plan_60_days(level: str, scores: ScoreBreakdown) -> tuple[str, str, str]:
    """Return 60-day actions."""

    if level in {"Acil Toparlanma", "Denge Kurma"}:
        return (
            "Borclarda ilk kapanis hedefini tamamla.",
            "Aylik acik varsa ikinci kesinti turunu uygula.",
            "Acil fonu en az 1 aya tasi.",
        )

    if scores.goal_discipline < 75:
        return (
            "Hedef tarihlerini takvime isle.",
            "Aylik birikim yuzdesini sabitle.",
            "Haftalik durum raporu al.",
        )

    return (
        "Portfoy dagilimini risk profiline gore gozden gecir.",
        "Gelir artirma seceneklerini degerlendir.",
        "Acil fonu 6 aya dogru buyut.",
    )


def _resolve_plan_90_days(level: str, scores: ScoreBreakdown) -> tuple[str, str, str]:
    """Return 90-day actions."""

    if level == "Acil Toparlanma":
        return (
            "Butceye kalici duzen ver.",
            "Gecikmesiz odeme serisi baslat.",
            "Acil fonu 1-2 ay seviyesine getir.",
        )

    if level == "Denge Kurma":
        return (
            "Borclarda net azalis hedefini tamamla.",
            "Acil fonu 3 ay seviyesine yaklastir.",
            "Yillik hedef karti olustur.",
        )

    if scores.cash_flow >= 75 and scores.debt_pressure >= 75:
        return (
            "Uzun vadeli birikim ve yatirim plani baslat.",
            "Yillik hedefler icin otomatik takip kur.",
            "Risk seviyesini yilda bir kez yeniden olc.",
        )

    return (
        "Zayif kalan skor alanini ikinci kez optimize et.",
        "Acil fonu bir ust kademeye tasi.",
        "Hedef metriklerini aylik raporla izle.",
    )


def _clamp(value: float, minimum: float, maximum: float) -> float:
    """Clamp value into closed interval."""

    return max(minimum, min(value, maximum))
