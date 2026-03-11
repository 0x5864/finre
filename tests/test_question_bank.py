"""Tests for question bank integrity."""

from __future__ import annotations

import unittest

from finre.question_bank import load_question_bank


class QuestionBankTests(unittest.TestCase):
    """Validate base shape of question records."""

    def test_question_count_is_40(self) -> None:
        """Question bank should contain 40 records for MVP."""

        records = load_question_bank()
        self.assertEqual(len(records), 40)

    def test_ids_are_unique(self) -> None:
        """Question IDs should be unique."""

        records = load_question_bank()
        ids: list[str] = [str(item["id"]) for item in records]

        self.assertEqual(len(ids), len(set(ids)))

    def test_required_fields_exist(self) -> None:
        """Every question should include core keys."""

        records = load_question_bank()
        required_fields: set[str] = {
            "id",
            "section",
            "prompt",
            "answer_type",
            "required",
        }

        for item in records:
            self.assertTrue(required_fields.issubset(item.keys()))


if __name__ == "__main__":
    unittest.main()
