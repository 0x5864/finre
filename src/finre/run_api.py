"""CLI helper to run the Finre API locally."""

from __future__ import annotations

import os


def _as_bool(value: str) -> bool:
    """Parse bool-like environment values."""

    return value.strip().lower() in {"1", "true", "yes", "on"}


def main() -> None:
    """Start uvicorn server for local development."""

    try:
        import uvicorn
    except ImportError as error:  # pragma: no cover - runtime guard
        raise RuntimeError(
            "uvicorn bulunamadi. Lutfen requirements dosyasini kur."
        ) from error

    host: str = os.getenv("FINRE_API_HOST", "127.0.0.1")
    port: int = int(os.getenv("FINRE_API_PORT", "8000"))
    reload_enabled: bool = _as_bool(os.getenv("FINRE_API_RELOAD", "0"))

    uvicorn.run("finre.api:app", host=host, port=port, reload=reload_enabled)


if __name__ == "__main__":
    main()
