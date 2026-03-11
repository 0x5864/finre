"""Unit tests for Finre scoring rules."""

from __future__ import annotations

import unittest

from finre.scoring import FinancialProfile, build_guidance, calculate_scores


class ScoringTests(unittest.TestCase):
    """Validate score thresholds and guidance output."""

    def test_strong_profile_scores_high(self) -> None:
        """Profile with healthy metrics should score in growth band."""

        profile: FinancialProfile = FinancialProfile(
            monthly_net_income=100_000,
            monthly_total_expense=70_000,
            monthly_debt_payment=5_000,
            emergency_fund_months=6,
            had_recent_payment_delay=False,
            goal_is_clear=True,
            has_goal_date=True,
            has_monthly_saving_habit=True,
            tracks_expenses=True,
        )

        scores = calculate_scores(profile)

        self.assertGreaterEqual(scores.total_score, 80)
        self.assertEqual(scores.cash_flow, 100)
        self.assertEqual(scores.debt_pressure, 100)

    def test_debt_penalty_applies(self) -> None:
        """Recent delay should reduce debt pressure score by penalty."""

        profile: FinancialProfile = FinancialProfile(
            monthly_net_income=50_000,
            monthly_total_expense=45_000,
            monthly_debt_payment=10_000,
            emergency_fund_months=2,
            had_recent_payment_delay=True,
            goal_is_clear=False,
            has_goal_date=False,
            has_monthly_saving_habit=False,
            tracks_expenses=False,
        )

        scores = calculate_scores(profile)

        self.assertEqual(scores.debt_pressure, 60)
        self.assertLess(scores.total_score, 60)

    def test_guidance_returns_three_priorities(self) -> None:
        """Guidance should always produce exactly three priority items."""

        profile: FinancialProfile = FinancialProfile(
            monthly_net_income=30_000,
            monthly_total_expense=35_000,
            monthly_debt_payment=18_000,
            emergency_fund_months=0,
            had_recent_payment_delay=True,
            goal_is_clear=False,
            has_goal_date=False,
            has_monthly_saving_habit=False,
            tracks_expenses=False,
        )

        scores = calculate_scores(profile)
        guidance = build_guidance(profile=profile, scores=scores)

        self.assertEqual(len(guidance.top_priorities), 3)
        self.assertEqual(guidance.level, "Acil Toparlanma")


if __name__ == "__main__":
    unittest.main()
