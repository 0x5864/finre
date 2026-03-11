"""Assessment service layer for profile scoring and guidance."""

from __future__ import annotations

from dataclasses import dataclass

from finre.scoring import (
    FinancialProfile,
    GuidanceResult,
    ScoreBreakdown,
    build_guidance,
    calculate_scores,
)


@dataclass(frozen=True)
class AssessmentResult:
    """Combined assessment output for API and UI consumers."""

    scores: ScoreBreakdown
    guidance: GuidanceResult


def run_assessment(profile: FinancialProfile) -> AssessmentResult:
    """Run scoring and guidance generation for a profile."""

    scores: ScoreBreakdown = calculate_scores(profile)
    guidance: GuidanceResult = build_guidance(profile=profile, scores=scores)

    return AssessmentResult(scores=scores, guidance=guidance)
