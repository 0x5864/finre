"""Fetch and export Kapalı Çarşı FX and silver rows from Enuygun page data."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import UTC, datetime
import csv
import json
from pathlib import Path
import re
from typing import Any

import httpx


ENUYGUN_ALTIN_URL: str = "https://www.enuygunfinans.com/altin-fiyatlari/"
ENUYGUN_DOVIZ_URL: str = "https://www.enuygunfinans.com/doviz-fiyatlari/"
TARGET_SOURCE_NAME: str = "Kapalı Çarşı"
NEXT_DATA_PATTERN: re.Pattern[str] = re.compile(
    r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
    flags=re.DOTALL,
)


class MarketPriceFetchError(RuntimeError):
    """Raised when source content cannot be fetched or parsed."""


@dataclass(frozen=True)
class FxPriceRow:
    """One normalized FX row for the Kapalı Çarşı source."""

    kaynak: str
    doviz_adi: str
    alis_fiyati: float
    satis_fiyati: float
    gunluk_degisim_yuzde: float | None
    gunluk_degisim_tutari: float | None
    guncellenme_tarihi: str | None


@dataclass(frozen=True)
class SilverPriceRow:
    """One normalized silver row for the Kapalı Çarşı source."""

    kaynak: str
    gumus_adi: str
    alis_fiyati: float
    satis_fiyati: float
    gunluk_degisim_yuzde: float | None
    gunluk_degisim_tutari: float | None
    guncellenme_tarihi: str | None


def fetch_kapali_carsi_fx_prices(
    *,
    timeout_seconds: float = 10.0,
    source_name: str = TARGET_SOURCE_NAME,
) -> list[FxPriceRow]:
    """Fetch Kapalı Çarşı FX rows from Enuygun and normalize them."""

    html: str = _fetch_html(url=ENUYGUN_DOVIZ_URL, timeout_seconds=timeout_seconds)
    return parse_fx_rows_from_html(html=html, source_name=source_name)


def fetch_kapali_carsi_silver_prices(
    *,
    timeout_seconds: float = 10.0,
    source_name: str = TARGET_SOURCE_NAME,
) -> list[SilverPriceRow]:
    """Fetch Kapalı Çarşı silver rows from Enuygun payloads.

    Note:
        If source payload does not expose silver rows, this returns an empty list.
    """

    altin_html: str = _fetch_html(url=ENUYGUN_ALTIN_URL, timeout_seconds=timeout_seconds)
    doviz_html: str = _fetch_html(url=ENUYGUN_DOVIZ_URL, timeout_seconds=timeout_seconds)
    return parse_silver_rows_from_html(
        altin_html=altin_html,
        doviz_html=doviz_html,
        source_name=source_name,
    )


def parse_fx_rows_from_html(
    *,
    html: str,
    source_name: str = TARGET_SOURCE_NAME,
) -> list[FxPriceRow]:
    """Parse FX rows from page HTML and return selected source rows."""

    payload: dict[str, Any] = _extract_next_data_payload(html)
    return extract_fx_rows_from_next_data(payload=payload, source_name=source_name)


def parse_silver_rows_from_html(
    *,
    altin_html: str,
    doviz_html: str,
    source_name: str = TARGET_SOURCE_NAME,
) -> list[SilverPriceRow]:
    """Parse silver rows from gold and FX HTML payloads."""

    altin_payload: dict[str, Any] = _extract_next_data_payload(altin_html)
    doviz_payload: dict[str, Any] = _extract_next_data_payload(doviz_html)
    return extract_silver_rows_from_payloads(
        altin_payload=altin_payload,
        doviz_payload=doviz_payload,
        source_name=source_name,
    )


def extract_fx_rows_from_next_data(
    *,
    payload: dict[str, Any],
    source_name: str = TARGET_SOURCE_NAME,
) -> list[FxPriceRow]:
    """Extract normalized FX rows from one __NEXT_DATA__ payload."""

    source_rows: list[dict[str, Any]] = _extract_source_rows(
        payload=payload,
        group_name="Multiple - Döviz",
        source_name=source_name,
    )

    normalized_rows: list[FxPriceRow] = []
    for row in source_rows:
        doviz_adi: str = _pick_row_name(row=row, candidate_keys=["Döviz Adı", "Döviz Çifti"])
        if doviz_adi == "":
            continue

        alis_fiyati: float = _as_float(_extract_row_value(row=row, key="Alış Fiyatı"))
        satis_fiyati: float = _as_float(_extract_row_value(row=row, key="Satış Fiyatı"))
        gunluk_degisim_yuzde: float | None = _as_optional_float(
            _extract_row_extra(row=row, key="Satış Fiyatı")
        )
        kapanis_fiyati: float | None = _as_optional_float(
            _extract_row_value(row=row, key="Kapanış")
        )
        gunluk_degisim_tutari: float | None = _resolve_change_amount(
            satis_fiyati=satis_fiyati,
            gunluk_degisim_yuzde=gunluk_degisim_yuzde,
            kapanis_fiyati=kapanis_fiyati,
        )
        guncellenme_tarihi: str | None = _pick_row_updated_at(
            row=row,
            candidate_keys=["Döviz Adı", "Döviz Çifti", "Satış Fiyatı"],
        )

        normalized_rows.append(
            FxPriceRow(
                kaynak=source_name,
                doviz_adi=doviz_adi,
                alis_fiyati=alis_fiyati,
                satis_fiyati=satis_fiyati,
                gunluk_degisim_yuzde=gunluk_degisim_yuzde,
                gunluk_degisim_tutari=gunluk_degisim_tutari,
                guncellenme_tarihi=guncellenme_tarihi,
            )
        )

    if not normalized_rows:
        raise MarketPriceFetchError(f"{source_name} için döviz satırı bulunamadı.")
    return normalized_rows


def extract_silver_rows_from_payloads(
    *,
    altin_payload: dict[str, Any],
    doviz_payload: dict[str, Any],
    source_name: str = TARGET_SOURCE_NAME,
) -> list[SilverPriceRow]:
    """Extract normalized silver rows from available payloads.

    Silver rows are detected by name/value text markers like "gümüş", "xag", "silver".
    """

    candidate_rows: list[dict[str, Any]] = []
    candidate_rows.extend(
        _extract_source_rows_or_empty(
            payload=altin_payload,
            group_name="Multiple - Altın",
            source_name=source_name,
        )
    )
    candidate_rows.extend(
        _extract_source_rows_or_empty(
            payload=doviz_payload,
            group_name="Multiple - Döviz",
            source_name=source_name,
        )
    )

    normalized_rows: list[SilverPriceRow] = []
    for row in candidate_rows:
        row_values_text: str = _concat_row_values(row=row)
        if not _contains_silver_marker(row_values_text):
            continue

        gumus_adi: str = _pick_row_name(
            row=row,
            candidate_keys=["Gümüş Adı", "Altın Adı", "Döviz Adı", "Döviz Çifti", "Emtia Adı"],
        )
        if gumus_adi == "":
            gumus_adi = "Gümüş"

        alis_fiyati: float = _as_float(_extract_row_value(row=row, key="Alış Fiyatı"))
        satis_fiyati: float = _as_float(_extract_row_value(row=row, key="Satış Fiyatı"))
        gunluk_degisim_yuzde: float | None = _as_optional_float(
            _extract_row_extra(row=row, key="Satış Fiyatı")
        )
        kapanis_fiyati: float | None = _as_optional_float(
            _extract_row_value(row=row, key="Kapanış")
        )
        gunluk_degisim_tutari: float | None = _resolve_change_amount(
            satis_fiyati=satis_fiyati,
            gunluk_degisim_yuzde=gunluk_degisim_yuzde,
            kapanis_fiyati=kapanis_fiyati,
        )
        guncellenme_tarihi: str | None = _pick_row_updated_at(
            row=row,
            candidate_keys=[
                "Gümüş Adı",
                "Altın Adı",
                "Döviz Adı",
                "Döviz Çifti",
                "Satış Fiyatı",
            ],
        )

        normalized_rows.append(
            SilverPriceRow(
                kaynak=source_name,
                gumus_adi=gumus_adi,
                alis_fiyati=alis_fiyati,
                satis_fiyati=satis_fiyati,
                gunluk_degisim_yuzde=gunluk_degisim_yuzde,
                gunluk_degisim_tutari=gunluk_degisim_tutari,
                guncellenme_tarihi=guncellenme_tarihi,
            )
        )

    return normalized_rows


def export_market_rows(
    *,
    rows: list[FxPriceRow] | list[SilverPriceRow],
    output_dir: Path,
    file_prefix: str,
    source_name: str = TARGET_SOURCE_NAME,
) -> tuple[Path, Path]:
    """Save rows as JSON and CSV files and return date-based output paths."""

    output_dir.mkdir(parents=True, exist_ok=True)

    now: datetime = datetime.now(UTC)
    date_str: str = now.strftime("%Y-%m-%d")
    json_path: Path = output_dir / f"{file_prefix}_{date_str}.json"
    csv_path: Path = output_dir / f"{file_prefix}_{date_str}.csv"
    latest_json_path: Path = output_dir / f"{file_prefix}_latest.json"
    latest_csv_path: Path = output_dir / f"{file_prefix}_latest.csv"

    row_payloads: list[dict[str, Any]] = [asdict(row) for row in rows]
    payload: dict[str, Any] = {
        "kaynak": source_name,
        "fetched_at_utc": now.isoformat(timespec="seconds"),
        "count": len(rows),
        "rows": row_payloads,
    }

    json_text: str = json.dumps(payload, ensure_ascii=False, indent=2)
    json_path.write_text(json_text, encoding="utf-8")
    latest_json_path.write_text(json_text, encoding="utf-8")

    csv_field_names: list[str] = list(row_payloads[0].keys()) if row_payloads else []
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        if csv_field_names:
            writer = csv.DictWriter(handle, fieldnames=csv_field_names)
            writer.writeheader()
            for row_payload in row_payloads:
                writer.writerow(row_payload)
    with latest_csv_path.open("w", encoding="utf-8", newline="") as handle:
        if csv_field_names:
            writer = csv.DictWriter(handle, fieldnames=csv_field_names)
            writer.writeheader()
            for row_payload in row_payloads:
                writer.writerow(row_payload)

    return json_path, csv_path


def _fetch_html(*, url: str, timeout_seconds: float) -> str:
    """Fetch one URL and return response HTML."""

    try:
        with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
            response: httpx.Response = client.get(url)
            response.raise_for_status()
    except httpx.HTTPError as error:
        raise MarketPriceFetchError("Kaynak sayfa alınamadı.") from error
    return response.text


def _extract_next_data_payload(html: str) -> dict[str, Any]:
    """Extract and decode the __NEXT_DATA__ JSON payload."""

    match: re.Match[str] | None = NEXT_DATA_PATTERN.search(html)
    if match is None:
        raise MarketPriceFetchError("__NEXT_DATA__ bulunamadı.")

    raw_payload: str = match.group(1)
    try:
        parsed: Any = json.loads(raw_payload)
    except json.JSONDecodeError as error:
        raise MarketPriceFetchError("__NEXT_DATA__ JSON parse edilemedi.") from error

    if not isinstance(parsed, dict):
        raise MarketPriceFetchError("__NEXT_DATA__ nesne formatında değil.")
    return parsed


def _extract_source_rows(
    *,
    payload: dict[str, Any],
    group_name: str,
    source_name: str,
) -> list[dict[str, Any]]:
    """Extract rows from one group and source, raising on missing data."""

    grouped_rows: dict[str, Any] | None = _extract_grouped_rows(
        payload=payload,
        group_name=group_name,
    )
    if grouped_rows is None:
        raise MarketPriceFetchError(f"{group_name} tablo verisi bulunamadı.")

    source_rows: Any = grouped_rows.get(source_name)
    if not isinstance(source_rows, list):
        raise MarketPriceFetchError(f"{source_name} kaynağı bulunamadı.")

    normalized_rows: list[dict[str, Any]] = []
    for row in source_rows:
        if isinstance(row, dict):
            normalized_rows.append(row)
    return normalized_rows


def _extract_source_rows_or_empty(
    *,
    payload: dict[str, Any],
    group_name: str,
    source_name: str,
) -> list[dict[str, Any]]:
    """Extract source rows and return empty list when source/group is missing."""

    try:
        return _extract_source_rows(
            payload=payload,
            group_name=group_name,
            source_name=source_name,
        )
    except MarketPriceFetchError:
        return []


def _extract_grouped_rows(
    *,
    payload: dict[str, Any],
    group_name: str,
) -> dict[str, Any] | None:
    """Find grouped rows by group name across known Enuygun payload shapes."""

    landing_body: Any = (
        payload.get("props", {})
        .get("pageProps", {})
        .get("landing", {})
        .get("body", [])
    )
    if not isinstance(landing_body, list):
        return None

    for component in _iter_dynamic_components(landing_body=landing_body):
        if component.get("groupName") != group_name:
            continue
        response_body: Any = component.get("response", {}).get("body")
        if isinstance(response_body, dict):
            return response_body
    return None


def _iter_dynamic_components(
    *,
    landing_body: list[Any],
) -> list[dict[str, Any]]:
    """Return dynamic data table candidates from landing body."""

    dynamic_components: list[dict[str, Any]] = []
    for item in landing_body:
        if not isinstance(item, dict):
            continue
        dynamic_components.append(item)
        nested_body: Any = (
            item.get("dynamic_component", {})
            .get("data", {})
            .get("attributes", {})
            .get("body", [])
        )
        if isinstance(nested_body, list):
            for nested_item in nested_body:
                if isinstance(nested_item, dict):
                    dynamic_components.append(nested_item)
    return dynamic_components


def _pick_row_name(*, row: dict[str, Any], candidate_keys: list[str]) -> str:
    """Pick first non-empty row name from candidate keys."""

    for key in candidate_keys:
        value_text: str = _as_optional_text(_extract_row_value(row=row, key=key)) or ""
        if value_text != "":
            return value_text
    return ""


def _pick_row_updated_at(*, row: dict[str, Any], candidate_keys: list[str]) -> str | None:
    """Pick first available update timestamp from candidate keys."""

    for key in candidate_keys:
        value_text: str | None = _as_optional_text(_extract_row_extra(row=row, key=key))
        if value_text:
            return value_text
    return None


def _extract_row_value(*, row: dict[str, Any], key: str) -> Any:
    """Extract nested row value safely."""

    value_container: Any = row.get(key)
    if not isinstance(value_container, dict):
        return None
    return value_container.get("value")


def _extract_row_extra(*, row: dict[str, Any], key: str) -> Any:
    """Extract nested row extra value safely."""

    value_container: Any = row.get(key)
    if not isinstance(value_container, dict):
        return None
    extra_container: Any = value_container.get("extra")
    if not isinstance(extra_container, dict):
        return None
    return extra_container.get("value")


def _resolve_change_amount(
    *,
    satis_fiyati: float,
    gunluk_degisim_yuzde: float | None,
    kapanis_fiyati: float | None,
) -> float | None:
    """Resolve amount change from close price first, then daily percent.

    Some source rows expose a close value that is equal to the current sell value
    while still reporting a non-zero daily percent. In that case we prefer the
    percent-based estimate so the exported amount is useful in the UI.
    """

    if kapanis_fiyati is not None:
        close_based_change: float = satis_fiyati - kapanis_fiyati
        if close_based_change != 0:
            return close_based_change
    if gunluk_degisim_yuzde is not None:
        return _estimate_change_amount_from_percent(
            selling_value=satis_fiyati,
            daily_percent=gunluk_degisim_yuzde,
        )
    return None


def _estimate_change_amount_from_percent(*, selling_value: float, daily_percent: float) -> float | None:
    """Estimate amount delta from daily percent when previous close is missing."""

    base: float = 1 + (daily_percent / 100)
    if not _is_finite(value=base) or base == 0:
        return None
    previous_value: float = selling_value / base
    return selling_value - previous_value


def _concat_row_values(*, row: dict[str, Any]) -> str:
    """Concatenate row values as one text blob for marker detection."""

    values: list[str] = []
    for value in row.values():
        if not isinstance(value, dict):
            continue
        value_text: str = _as_optional_text(value.get("value")) or ""
        if value_text != "":
            values.append(value_text)
    return " | ".join(values)


def _contains_silver_marker(text: str) -> bool:
    """Return True when text appears to describe a silver instrument."""

    normalized_text: str = (
        text.casefold()
        .replace("ü", "u")
        .replace("ı", "i")
        .replace("ğ", "g")
        .replace("ş", "s")
        .replace("ö", "o")
        .replace("ç", "c")
    )
    markers: tuple[str, ...] = ("gumus", "xag", "silver")
    return any(marker in normalized_text for marker in markers)


def _as_float(value: Any) -> float:
    """Convert unknown value to float, return 0.0 on conversion errors."""

    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _as_optional_float(value: Any) -> float | None:
    """Convert unknown value to float, return None on conversion errors."""

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _as_optional_text(value: Any) -> str | None:
    """Convert unknown value to non-empty text or return None."""

    if value is None:
        return None
    text: str = str(value).strip()
    return text if text else None


def _is_finite(*, value: float) -> bool:
    """Check finite float value without importing math for one helper."""

    return value == value and value not in (float("inf"), float("-inf"))
