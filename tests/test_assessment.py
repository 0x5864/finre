"""Tests for assessment service behavior."""

from __future__ import annotations

import unittest

from finre.assessment import run_assessment
from finre.scoring import FinancialProfile


class AssessmentTests(unittest.TestCase):
    """Validate assessment wrapper output."""

    def test_assessment_produces_scores_and_guidance(self) -> None:
        """Assessment should include non-empty score and guidance fields."""

        profile: FinancialProfile = FinancialProfile(
            monthly_net_income=80_000,
            monthly_total_expense=55_000,
            monthly_debt_payment=15_000,
            emergency_fund_months=2,
            had_recent_payment_delay=False,
            goal_is_clear=True,
            has_goal_date=False,
            has_monthly_saving_habit=True,
            tracks_expenses=True,
        )

        result = run_assessment(profile)

        self.assertGreaterEqual(result.scores.total_score, 0)
        self.assertLessEqual(result.scores.total_score, 100)
        self.assertEqual(len(result.guidance.top_priorities), 3)


if __name__ == "__main__":
    unittest.main()
