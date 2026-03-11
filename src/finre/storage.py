"""SQLite-backed session storage for Finre onboarding data."""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterator
from uuid import uuid4


MAX_ANSWER_KEYS: int = 200
MAX_ANSWERS_JSON_BYTES: int = 100_000


@dataclass(frozen=True)
class SessionRecord:
    """Persisted session record."""

    session_id: str
    answers: dict[str, Any]
    created_at: str
    updated_at: str


def default_db_path() -> Path:
    """Return the default SQLite file path."""

    return Path(__file__).resolve().parents[2] / "data" / "finre.sqlite3"


def resolve_db_path() -> Path:
    """Resolve storage path from environment or default location."""

    env_value: str = os.getenv("FINRE_DB_PATH", "").strip()
    if not env_value:
        return default_db_path()

    return Path(env_value).expanduser().resolve()


def init_storage(db_path: Path | None = None) -> None:
    """Initialize storage schema if it does not exist."""

    resolved: Path = db_path or resolve_db_path()
    resolved.parent.mkdir(parents=True, exist_ok=True)

    with _managed_connection(resolved) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                answers_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        connection.commit()


def create_session(db_path: Path | None = None) -> str:
    """Create a new empty session and return its ID."""

    resolved: Path = db_path or resolve_db_path()
    init_storage(resolved)

    session_id: str = str(uuid4())
    now: str = _utc_now_iso()

    with _managed_connection(resolved) as connection:
        connection.execute(
            """
            INSERT INTO sessions (session_id, answers_json, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            """,
            (session_id, "{}", now, now),
        )
        connection.commit()

    return session_id


def save_answers(
    session_id: str,
    answers: dict[str, Any],
    db_path: Path | None = None,
) -> int:
    """Overwrite answers for a session and return saved key count."""

    if len(answers) > MAX_ANSWER_KEYS:
        raise ValueError("answers contain too many keys")

    answers_json: str = json.dumps(answers, ensure_ascii=True, separators=(",", ":"))
    if len(answers_json.encode("utf-8")) > MAX_ANSWERS_JSON_BYTES:
        raise ValueError("answers payload is too large")

    resolved: Path = db_path or resolve_db_path()
    init_storage(resolved)

    now: str = _utc_now_iso()
    with _managed_connection(resolved) as connection:
        cursor = connection.execute(
            """
            UPDATE sessions
            SET answers_json = ?, updated_at = ?
            WHERE session_id = ?
            """,
            (answers_json, now, session_id),
        )
        connection.commit()

    if cursor.rowcount == 0:
        raise KeyError("session not found")

    return len(answers)


def get_session(
    session_id: str,
    db_path: Path | None = None,
) -> SessionRecord | None:
    """Fetch one session by ID."""

    resolved: Path = db_path or resolve_db_path()
    init_storage(resolved)

    with _managed_connection(resolved) as connection:
        row = connection.execute(
            """
            SELECT session_id, answers_json, created_at, updated_at
            FROM sessions
            WHERE session_id = ?
            """,
            (session_id,),
        ).fetchone()

    if row is None:
        return None

    raw_answers: Any = json.loads(str(row["answers_json"]))
    if not isinstance(raw_answers, dict):
        raise ValueError("stored answers_json must decode to object")

    return SessionRecord(
        session_id=str(row["session_id"]),
        answers=raw_answers,
        created_at=str(row["created_at"]),
        updated_at=str(row["updated_at"]),
    )


@contextmanager
def _managed_connection(db_path: Path) -> Iterator[sqlite3.Connection]:
    """Open and close SQLite connection with row access by key."""

    connection: sqlite3.Connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
    finally:
        connection.close()


def _utc_now_iso() -> str:
    """Return current UTC timestamp in ISO-8601 format."""

    return datetime.now(UTC).isoformat(timespec="seconds")
