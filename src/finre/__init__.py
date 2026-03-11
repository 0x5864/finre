"""Finre core package."""

from finre.answer_mapping import build_profile_from_answers
from finre.assessment import AssessmentResult, run_assessment
from finre.question_bank import load_question_bank
from finre.scoring import (
    FinancialProfile,
    GuidanceResult,
    ScoreBreakdown,
    build_guidance,
    calculate_scores,
)
from finre.storage import SessionRecord, create_session, get_session, save_answers

__all__: list[str] = [
    "FinancialProfile",
    "ScoreBreakdown",
    "GuidanceResult",
    "AssessmentResult",
    "SessionRecord",
    "calculate_scores",
    "build_guidance",
    "run_assessment",
    "load_question_bank",
    "build_profile_from_answers",
    "create_session",
    "save_answers",
    "get_session",
]
