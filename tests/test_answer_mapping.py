"""Tests for raw answer to assessment profile mapping."""

from __future__ import annotations

import unittest

from finre.answer_mapping import AssessmentInputError, build_profile_from_answers


class AnswerMappingTests(unittest.TestCase):
    """Validate required-key and normalization behavior."""

    def test_build_profile_from_answers_success(self) -> None:
        """Valid answer map should produce expected profile fields."""

        answers: dict[str, object] = {
            "q07": 100_000,
            "q13": 20_000,
            "q14": 5_000,
            "q15": 8_000,
            "q16": 3_000,
            "q17": 2_000,
            "q18": 1_000,
            "q19": 4_000,
            "q20": "Her ay",
            "q25": 10_000,
            "q26": "Evet",
            "q30": 3,
            "q34": "Borclari azaltacagim",
            "q36": "Evet",
            "q38": "Planli",
        }

        profile = build_profile_from_answers(answers)

        self.assertEqual(profile.monthly_total_expense, 43_000)
        self.assertTrue(profile.had_recent_payment_delay)
        self.assertTrue(profile.has_goal_date)

    def test_build_profile_from_answers_raises_on_missing_keys(self) -> None:
        """Missing required keys should raise explicit error."""

        with self.assertRaises(AssessmentInputError):
            build_profile_from_answers({"q07": 100_000})


if __name__ == "__main__":
    unittest.main()
