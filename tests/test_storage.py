"""Tests for SQLite session storage utilities."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from finre.storage import create_session, get_session, init_storage, save_answers


class StorageTests(unittest.TestCase):
    """Validate CRUD-like behavior for session storage."""

    def test_create_save_and_get_session(self) -> None:
        """Session answers should persist and be retrievable."""

        with tempfile.TemporaryDirectory() as temp_dir:
            db_path: Path = Path(temp_dir) / "storage_test.sqlite3"
            init_storage(db_path)

            session_id: str = create_session(db_path)
            saved_count: int = save_answers(
                session_id=session_id,
                answers={"q07": 100_000, "q13": 25_000},
                db_path=db_path,
            )
            session = get_session(session_id=session_id, db_path=db_path)

            self.assertEqual(saved_count, 2)
            self.assertIsNotNone(session)
            self.assertEqual(session.answers["q07"], 100_000)

    def test_get_session_returns_none_for_unknown_session(self) -> None:
        """Unknown session IDs should return None."""

        with tempfile.TemporaryDirectory() as temp_dir:
            db_path: Path = Path(temp_dir) / "storage_test.sqlite3"
            init_storage(db_path)

            session = get_session(session_id="missing", db_path=db_path)

            self.assertIsNone(session)


if __name__ == "__main__":
    unittest.main()
