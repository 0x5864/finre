"""TEFAS data fetch and normalization helpers."""

from __future__ import annotations

from datetime import date, timedelta
import math
from typing import Any

import httpx


TEFAS_ENDPOINT: str = "https://www.tefas.gov.tr/api/DB/BindHistoryInfo"
TEFAS_COMPARISON_ENDPOINT: str = "https://www.tefas.gov.tr/api/DB/BindComparisonFundReturns"
TEFAS_COMPARISON_FEES_ENDPOINT: str = (
    "https://www.tefas.gov.tr/api/DB/BindComparisonManagementFees"
)
TEFAS_COMPARISON_SIZES_ENDPOINT: str = (
    "https://www.tefas.gov.tr/api/DB/BindComparisonFundSizes"
)
TEFAS_DEFAULT_LOOKBACK_DAYS: int = 7
TEFAS_HISTORY_LOOKBACK_DAYS: int = 400
TEFAS_COMPARISON_LOOKBACK_DAYS: int = 30
TEFAS_MAX_LIMIT: int = 100
MS_IN_DAY: int = 86_400_000


class TefasFetchError(RuntimeError):
    """Raised when TEFAS data cannot be fetched or parsed."""


def build_tefas_payload(
    *,
    today: date | None = None,
    lookback_days: int = TEFAS_DEFAULT_LOOKBACK_DAYS,
    fon_kodu: str = "",
) -> dict[str, str]:
    """Build form payload for TEFAS history endpoint."""

    reference_date: date = today or date.today()
    safe_lookback_days: int = max(1, lookback_days)
    start_date: date = reference_date - timedelta(days=safe_lookback_days)

    return {
        "fontip": "YAT",
        "bastarih": start_date.strftime("%d.%m.%Y"),
        "bittarih": reference_date.strftime("%d.%m.%Y"),
        "fonunvantip": "",
        "sfontur": "",
        "fonkod": fon_kodu.strip().upper(),
        "fongrup": "",
        "kurucunkod": "",
        "page": "1",
        "pagesize": "4000",
    }


def fetch_tefas_rows(
    *,
    timeout_seconds: float = 8.0,
    lookback_days: int = TEFAS_DEFAULT_LOOKBACK_DAYS,
    fon_kodu: str = "",
) -> list[dict[str, Any]]:
    """Fetch raw TEFAS rows from official endpoint."""

    try:
        with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
            return _fetch_tefas_rows_with_client(
                client=client,
                lookback_days=lookback_days,
                fon_kodu=fon_kodu,
            )
    except httpx.HTTPError as error:
        raise TefasFetchError("TEFAS endpoint read failed") from error


def build_tefas_comparison_payload() -> dict[str, str]:
    """Build payload for TEFAS comparison endpoint with period returns enabled."""

    return build_tefas_comparison_returns_payload()


def build_tefas_comparison_returns_payload() -> dict[str, str]:
    """Build payload for TEFAS returns comparison endpoint."""

    return {
        "calismatipi": "2",
        "fontip": "YAT",
        "sfontur": "",
        "kurucukod": "",
        "fongrup": "",
        "bastarih": "",
        "bittarih": "",
        "fonturkod": "",
        "fonunvantip": "",
        "strperiod": "1,1,1,1,1,1,1",
        "islemdurum": "1",
    }


def build_tefas_comparison_fee_payload() -> dict[str, str]:
    """Build payload for TEFAS management fee comparison endpoint."""

    return {
        "fontip": "YAT",
        "sfontur": "",
        "kurucukod": "",
        "fongrup": "",
        "fonturkod": "",
        "fonunvantip": "",
        "islemdurum": "1",
    }


def build_tefas_comparison_size_payload(
    *,
    today: date | None = None,
    lookback_days: int = TEFAS_COMPARISON_LOOKBACK_DAYS,
) -> dict[str, str]:
    """Build payload for TEFAS fund size comparison endpoint."""

    reference_date: date = today or date.today()
    safe_lookback_days: int = max(1, lookback_days)
    start_date: date = reference_date - timedelta(days=safe_lookback_days)

    return {
        "calismatipi": "1",
        "fontip": "YAT",
        "sfontur": "",
        "kurucukod": "",
        "fongrup": "",
        "bastarih": start_date.strftime("%d.%m.%Y"),
        "bittarih": reference_date.strftime("%d.%m.%Y"),
        "fonturkod": "",
        "fonunvantip": "",
        "strperiod": "1,1,1,1,1,1,1",
        "islemdurum": "1",
    }


def fetch_tefas_comparison_rows(
    *,
    timeout_seconds: float = 8.0,
) -> list[dict[str, Any]]:
    """Fetch TEFAS comparison rows that include 1-month and 1-year return columns."""

    return fetch_tefas_comparison_return_rows(timeout_seconds=timeout_seconds)


def fetch_tefas_comparison_return_rows(
    *,
    timeout_seconds: float = 8.0,
) -> list[dict[str, Any]]:
    """Fetch TEFAS comparison rows for normal investment fund returns."""

    return _fetch_tefas_comparison_rows(
        endpoint=TEFAS_COMPARISON_ENDPOINT,
        payload=build_tefas_comparison_returns_payload(),
        timeout_seconds=timeout_seconds,
    )


def fetch_tefas_comparison_fee_rows(
    *,
    timeout_seconds: float = 8.0,
) -> list[dict[str, Any]]:
    """Fetch TEFAS comparison rows for management fees."""

    return _fetch_tefas_comparison_rows(
        endpoint=TEFAS_COMPARISON_FEES_ENDPOINT,
        payload=build_tefas_comparison_fee_payload(),
        timeout_seconds=timeout_seconds,
    )


def fetch_tefas_comparison_size_rows(
    *,
    timeout_seconds: float = 8.0,
    today: date | None = None,
    lookback_days: int = TEFAS_COMPARISON_LOOKBACK_DAYS,
) -> list[dict[str, Any]]:
    """Fetch TEFAS comparison rows for fund sizes."""

    return _fetch_tefas_comparison_rows(
        endpoint=TEFAS_COMPARISON_SIZES_ENDPOINT,
        payload=build_tefas_comparison_size_payload(
            today=today,
            lookback_days=lookback_days,
        ),
        timeout_seconds=timeout_seconds,
    )


def _fetch_tefas_comparison_rows(
    *,
    endpoint: str,
    payload: dict[str, str],
    timeout_seconds: float,
) -> list[dict[str, Any]]:
    """Fetch one TEFAS comparison dataset as a normalized row list."""

    headers: dict[str, str] = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json",
    }

    try:
        with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
            response: httpx.Response = client.post(
                endpoint,
                headers=headers,
                data=payload,
            )
            response.raise_for_status()
            body: Any = response.json()
    except (httpx.HTTPError, ValueError) as error:
        raise TefasFetchError("TEFAS comparison endpoint read failed") from error

    if not isinstance(body, dict):
        raise TefasFetchError("TEFAS comparison response must be a JSON object")

    raw_rows: Any = body.get("data", [])
    if not isinstance(raw_rows, list):
        raise TefasFetchError("TEFAS comparison data field must be a list")

    normalized_rows: list[dict[str, Any]] = []
    for row in raw_rows:
        if isinstance(row, dict):
            normalized_rows.append(row)
    return normalized_rows


def extract_tefas_returns_map(
    *,
    rows: list[dict[str, Any]],
) -> dict[str, tuple[float | None, float | None]]:
    """Build a fund-code keyed map of (1-month return, 1-year return)."""

    mapping: dict[str, tuple[float | None, float | None]] = {}
    for row in rows:
        fund_code: str = _as_clean_text(row.get("FONKODU"))
        if fund_code == "-":
            continue

        one_month_return: float | None = _as_optional_signed_float(row.get("GETIRI1A"))
        one_year_return: float | None = _as_optional_signed_float(row.get("GETIRI1Y"))
        mapping[fund_code] = (one_month_return, one_year_return)
    return mapping


def normalize_tefas_rows(
    *,
    rows: list[dict[str, Any]],
    limit: int,
) -> list[dict[str, Any]]:
    """Normalize TEFAS rows into frontend-friendly shape."""

    safe_limit: int = max(1, min(limit, TEFAS_MAX_LIMIT))
    transformed: list[dict[str, Any]] = []

    for row in rows:
        portfoy_buyuklugu: float = _as_float(row.get("PORTFOYBUYUKLUK"))
        transformed.append(
            {
                "fon_kodu": _as_clean_text(row.get("FONKODU")),
                "fon_unvani": _as_clean_text(row.get("FONUNVAN")),
                "fiyat": _as_float(row.get("FIYAT")),
                "kisi_sayisi": int(_as_float(row.get("KISISAYISI"))),
                "portfoy_buyuklugu": portfoy_buyuklugu,
                "tarih_ms": _as_clean_text(row.get("TARIH")),
                "tarih": _format_ms_date(row.get("TARIH")),
                "bir_aylik_getiri": None,
                "bir_yillik_getiri": None,
            }
        )

    transformed.sort(
        key=lambda item: item["portfoy_buyuklugu"],
        reverse=True,
    )
    return transformed[:safe_limit]


def enrich_tefas_rows_with_returns(
    *,
    rows: list[dict[str, Any]],
    timeout_seconds: float = 8.0,
) -> list[dict[str, Any]]:
    """Attach 1-month and 1-year return percentages to normalized rows."""

    if not rows:
        return []

    enriched_rows: list[dict[str, Any]] = [dict(row) for row in rows]
    try:
        with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
            for row in enriched_rows:
                fon_kodu: str = _as_clean_text(row.get("fon_kodu"))
                current_price: float = _as_float(row.get("fiyat"))
                current_timestamp_ms: int = _as_timestamp_ms(row.get("tarih_ms"))
                if fon_kodu == "-" or current_price <= 0 or current_timestamp_ms <= 0:
                    continue

                try:
                    history_rows: list[dict[str, Any]] = _fetch_tefas_rows_with_client(
                        client=client,
                        lookback_days=TEFAS_HISTORY_LOOKBACK_DAYS,
                        fon_kodu=fon_kodu,
                    )
                except TefasFetchError:
                    continue

                price_series: list[tuple[int, float]] = _extract_price_series(history_rows)
                row["bir_aylik_getiri"] = _calculate_period_return_percent(
                    current_price=current_price,
                    current_timestamp_ms=current_timestamp_ms,
                    price_series=price_series,
                    days_back=30,
                )
                row["bir_yillik_getiri"] = _calculate_period_return_percent(
                    current_price=current_price,
                    current_timestamp_ms=current_timestamp_ms,
                    price_series=price_series,
                    days_back=365,
                )
    except httpx.HTTPError:
        return enriched_rows

    return enriched_rows


def _fetch_tefas_rows_with_client(
    *,
    client: httpx.Client,
    lookback_days: int,
    fon_kodu: str,
) -> list[dict[str, Any]]:
    """Fetch TEFAS rows with shared HTTP client."""

    payload: dict[str, str] = build_tefas_payload(
        lookback_days=lookback_days,
        fon_kodu=fon_kodu,
    )
    headers: dict[str, str] = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json",
    }

    try:
        response: httpx.Response = client.post(
            TEFAS_ENDPOINT,
            headers=headers,
            data=payload,
        )
        response.raise_for_status()
        body: Any = response.json()
    except (httpx.HTTPError, ValueError) as error:
        raise TefasFetchError("TEFAS endpoint read failed") from error

    if not isinstance(body, dict):
        raise TefasFetchError("TEFAS response must be a JSON object")

    raw_rows: Any = body.get("data", [])
    if not isinstance(raw_rows, list):
        raise TefasFetchError("TEFAS response data field must be a list")

    normalized_rows: list[dict[str, Any]] = []
    for row in raw_rows:
        if isinstance(row, dict):
            normalized_rows.append(row)
    return normalized_rows


def _extract_price_series(rows: list[dict[str, Any]]) -> list[tuple[int, float]]:
    """Extract sorted unique (timestamp_ms, price) tuples from history rows."""

    by_timestamp: dict[int, float] = {}
    for row in rows:
        timestamp_ms: int = _as_timestamp_ms(row.get("TARIH"))
        price: float = _as_float(row.get("FIYAT"))
        if timestamp_ms > 0 and price > 0:
            by_timestamp[timestamp_ms] = price

    return sorted(by_timestamp.items(), key=lambda item: item[0])


def _calculate_period_return_percent(
    *,
    current_price: float,
    current_timestamp_ms: int,
    price_series: list[tuple[int, float]],
    days_back: int,
) -> float | None:
    """Calculate percent return for one period based on closest prior price."""

    reference_price: float | None = _find_reference_price(
        price_series=price_series,
        target_timestamp_ms=current_timestamp_ms - (days_back * MS_IN_DAY),
    )
    if reference_price is None or reference_price <= 0:
        return None
    if current_price <= 0:
        return None

    return ((current_price / reference_price) - 1.0) * 100.0


def _find_reference_price(
    *,
    price_series: list[tuple[int, float]],
    target_timestamp_ms: int,
) -> float | None:
    """Find latest price at or before target timestamp."""

    if not price_series:
        return None

    for timestamp_ms, price in reversed(price_series):
        if timestamp_ms <= target_timestamp_ms:
            return price
    return None


def _as_float(value: Any) -> float:
    """Convert unknown numeric value into float safely."""

    try:
        parsed: float = float(value)
    except (TypeError, ValueError):
        return 0.0
    if parsed < 0:
        return 0.0
    return parsed


def _as_optional_signed_float(value: Any) -> float | None:
    """Convert unknown numeric value into signed float; return None on blank/invalid."""

    if value is None:
        return None
    if isinstance(value, (int, float)):
        numeric_value: float = float(value)
        if not math.isfinite(numeric_value):
            return None
        return numeric_value

    text: str = str(value).strip()
    if text == "" or text == "-":
        return None

    if "," in text and "." in text:
        if text.rfind(",") > text.rfind("."):
            text = text.replace(".", "").replace(",", ".")
        else:
            text = text.replace(",", "")
    elif "," in text:
        text = text.replace(",", ".")

    try:
        return float(text)
    except ValueError:
        return None


def _as_timestamp_ms(value: Any) -> int:
    """Convert unknown timestamp value into positive integer milliseconds."""

    try:
        parsed: int = int(value)
    except (TypeError, ValueError):
        return 0
    if parsed <= 0:
        return 0
    return parsed


def _as_clean_text(value: Any) -> str:
    """Return stripped text representation with ASCII-safe defaults."""

    text: str = str(value or "").strip()
    return text or "-"


def _format_ms_date(raw_value: Any) -> str:
    """Convert millisecond timestamp into DD.MM.YYYY."""

    timestamp_ms: int = _as_timestamp_ms(raw_value)
    if timestamp_ms <= 0:
        return "-"

    day: date = date.fromtimestamp(timestamp_ms / 1000)
    return day.strftime("%d.%m.%Y")
