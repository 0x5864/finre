"""API tests that run when FastAPI and httpx are installed."""

from __future__ import annotations

import os
import tempfile
import unittest
from typing import Any

try:
    from fastapi.testclient import TestClient
except ImportError:  # pragma: no cover - optional dependency
    TestClient = None  # type: ignore[assignment]

from finre.api import create_app


@unittest.skipIf(TestClient is None, "FastAPI dependencies are not installed.")
class ApiTests(unittest.TestCase):
    """Smoke and flow tests for API routes."""

    def setUp(self) -> None:
        """Create isolated app instance with temp SQLite DB."""

        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path: str = os.path.join(self.temp_dir.name, "finre_test.sqlite3")
        os.environ["FINRE_DB_PATH"] = self.db_path

        self.client = TestClient(create_app())

    def tearDown(self) -> None:
        """Clean temporary DB resources."""

        os.environ.pop("FINRE_DB_PATH", None)
        self.temp_dir.cleanup()

    def test_health_endpoint(self) -> None:
        """Health endpoint should return status ok."""

        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("status"), "ok")

    def test_session_save_and_read_flow(self) -> None:
        """Session endpoints should save and return answer state."""

        create_response = self.client.post("/api/v1/sessions")
        self.assertEqual(create_response.status_code, 200)

        session_id: str = str(create_response.json()["session_id"])
        payload: dict[str, Any] = {
            "answers": {
                "q07": 80_000,
                "q13": 20_000,
            }
        }
        save_response = self.client.put(
            f"/api/v1/sessions/{session_id}/answers",
            json=payload,
        )
        self.assertEqual(save_response.status_code, 200)
        self.assertEqual(save_response.json().get("saved_keys"), 2)

        state_response = self.client.get(f"/api/v1/sessions/{session_id}")
        self.assertEqual(state_response.status_code, 200)
        self.assertEqual(state_response.json()["answers"]["q07"], 80_000)

    def test_session_assessment_flow(self) -> None:
        """Assessment should be produced from persisted session answers."""

        create_response = self.client.post("/api/v1/sessions")
        session_id: str = str(create_response.json()["session_id"])

        full_answers: dict[str, Any] = {
            "q07": 100_000,
            "q13": 20_000,
            "q14": 4_000,
            "q15": 8_000,
            "q16": 3_000,
            "q17": 1_500,
            "q18": 1_000,
            "q19": 2_500,
            "q20": "Her ay",
            "q25": 10_000,
            "q26": "Hayir",
            "q30": 4,
            "q34": "Acil fonu buyutmek",
            "q36": "Evet",
            "q38": "Planli",
        }
        self.client.put(
            f"/api/v1/sessions/{session_id}/answers",
            json={"answers": full_answers},
        )

        assessment_response = self.client.post(
            f"/api/v1/sessions/{session_id}/assessment"
        )

        self.assertEqual(assessment_response.status_code, 200)
        body = assessment_response.json()
        self.assertEqual(body.get("session_id"), session_id)
        self.assertIn("scores", body)
        self.assertIn("guidance", body)
        self.assertGreaterEqual(body["scores"]["total_score"], 0)

    def test_session_assessment_returns_422_when_answers_missing(self) -> None:
        """Session assessment should fail if required answer keys are missing."""

        create_response = self.client.post("/api/v1/sessions")
        session_id: str = str(create_response.json()["session_id"])

        assessment_response = self.client.post(
            f"/api/v1/sessions/{session_id}/assessment"
        )

        self.assertEqual(assessment_response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
