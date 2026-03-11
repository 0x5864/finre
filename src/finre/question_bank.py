"""Question bank loading utilities."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


REQUIRED_KEYS: frozenset[str] = frozenset(
    {"id", "section", "prompt", "answer_type", "required"}
)


def question_bank_path() -> Path:
    """Return the default question bank JSON path."""

    return Path(__file__).resolve().parents[2] / "data" / "question_bank_tr.json"


@lru_cache(maxsize=1)
def load_question_bank(path: Path | None = None) -> list[dict[str, Any]]:
    """Load and validate question bank records from JSON."""

    resolved_path: Path = path or question_bank_path()

    with resolved_path.open("r", encoding="utf-8") as handle:
        raw_data: Any = json.load(handle)

    if not isinstance(raw_data, list):
        raise ValueError("Question bank root must be a list.")

    validated: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for index, item in enumerate(raw_data):
        if not isinstance(item, dict):
            raise ValueError(f"Question item at index {index} must be an object.")

        missing: set[str] = set(REQUIRED_KEYS.difference(item.keys()))
        if missing:
            missing_str: str = ", ".join(sorted(missing))
            raise ValueError(
                f"Question item at index {index} is missing keys: {missing_str}."
            )

        question_id: Any = item["id"]
        if not isinstance(question_id, str) or not question_id.strip():
            raise ValueError(f"Question item at index {index} has invalid id.")
        if question_id in seen_ids:
            raise ValueError(f"Question id '{question_id}' is duplicated.")
        seen_ids.add(question_id)

        validated.append(item)

    return validated
