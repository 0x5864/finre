"""Fetch and export gold prices from Enuygun Finans page data."""

from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import UTC, datetime
import csv
import json
from pathlib import Path
import re
from typing import Any

import httpx


ENUYGUN_ALTIN_URL: str = "https://www.enuygunfinans.com/altin-fiyatlari/"
TARGET_SOURCE_NAME: str = "Kapalı Çarşı"
NEXT_DATA_PATTERN: re.Pattern[str] = re.compile(
    r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
    flags=re.DOTALL,
)


class GoldPriceFetchError(RuntimeError):
    """Raised when source content cannot be fetched or parsed."""


@dataclass(frozen=True)
class GoldPriceRow:
    """One normalized gold price row."""

    kaynak: str
    altin_adi: str
    alis_fiyati: float
    satis_fiyati: float
    gunluk_degisim_yuzde: float | None
    guncellenme_tarihi: str | None


def fetch_gold_prices(
    *,
    timeout_seconds: float = 10.0,
    source_name: str = TARGET_SOURCE_NAME,
) -> list[GoldPriceRow]:
    """Fetch live gold price rows and return only rows from one source."""

    try:
        with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
            response: httpx.Response = client.get(ENUYGUN_ALTIN_URL)
            response.raise_for_status()
            html: str = response.text
    except httpx.HTTPError as error:
        raise GoldPriceFetchError("Altın fiyat sayfası alınamadı.") from error

    return parse_gold_rows_from_html(html=html, source_name=source_name)


def parse_gold_rows_from_html(
    *,
    html: str,
    source_name: str = TARGET_SOURCE_NAME,
) -> list[GoldPriceRow]:
    """Parse page HTML and return normalized rows from one source."""

    next_data: dict[str, Any] = _extract_next_data_payload(html)
    return extract_gold_rows_from_next_data(
        payload=next_data,
        source_name=source_name,
    )


def extract_gold_rows_from_next_data(
    *,
    payload: dict[str, Any],
    source_name: str = TARGET_SOURCE_NAME,
) -> list[GoldPriceRow]:
    """Extract rows from __NEXT_DATA__ payload for selected source."""

    body_components: Any = (
        payload.get("props", {})
        .get("pageProps", {})
        .get("landing", {})
        .get("body", [])
    )
    if not isinstance(body_components, list):
        raise GoldPriceFetchError("Sayfa verisi beklenen formatta değil.")

    grouped_rows: dict[str, list[dict[str, Any]]] | None = None
    for body_component in body_components:
        if not isinstance(body_component, dict):
            continue
        dynamic_body: Any = (
            body_component.get("dynamic_component", {})
            .get("data", {})
            .get("attributes", {})
            .get("body", [])
        )
        if not isinstance(dynamic_body, list):
            continue
        for item in dynamic_body:
            if not isinstance(item, dict):
                continue
            if item.get("groupName") != "Multiple - Altın":
                continue
            response_body: Any = item.get("response", {}).get("body")
            if isinstance(response_body, dict):
                grouped_rows = response_body
                break
        if grouped_rows is not None:
            break

    if grouped_rows is None:
        raise GoldPriceFetchError("Altın tablo verisi bulunamadı.")

    source_rows: Any = grouped_rows.get(source_name)
    if not isinstance(source_rows, list):
        raise GoldPriceFetchError(f"{source_name} kaynağı bulunamadı.")

    normalized_rows: list[GoldPriceRow] = []
    for row in source_rows:
        if not isinstance(row, dict):
            continue
        altin_adi_obj: dict[str, Any] = _as_dict(row.get("Altın Adı"))
        alis_obj: dict[str, Any] = _as_dict(row.get("Alış Fiyatı"))
        satis_obj: dict[str, Any] = _as_dict(row.get("Satış Fiyatı"))
        altin_adi: str = str(altin_adi_obj.get("value", "")).strip()
        if not altin_adi:
            continue

        guncellenme_tarihi: str | None = _as_optional_text(
            _as_dict(altin_adi_obj.get("extra")).get("value")
        )
        gunluk_degisim_yuzde: float | None = _as_optional_float(
            _as_dict(satis_obj.get("extra")).get("value")
        )

        normalized_rows.append(
            GoldPriceRow(
                kaynak=source_name,
                altin_adi=altin_adi,
                alis_fiyati=_as_float(alis_obj.get("value")),
                satis_fiyati=_as_float(satis_obj.get("value")),
                gunluk_degisim_yuzde=gunluk_degisim_yuzde,
                guncellenme_tarihi=guncellenme_tarihi,
            )
        )

    if not normalized_rows:
        raise GoldPriceFetchError(f"{source_name} için satır bulunamadı.")

    return normalized_rows


def export_gold_rows(
    *,
    rows: list[GoldPriceRow],
    output_dir: Path,
    file_prefix: str = "altin_kapali_carsi",
) -> tuple[Path, Path]:
    """Save rows as JSON and CSV files and return both paths."""

    output_dir.mkdir(parents=True, exist_ok=True)

    now: datetime = datetime.now(UTC)
    date_str: str = now.strftime("%Y-%m-%d")
    json_path: Path = output_dir / f"{file_prefix}_{date_str}.json"
    csv_path: Path = output_dir / f"{file_prefix}_{date_str}.csv"
    latest_json_path: Path = output_dir / f"{file_prefix}_latest.json"
    latest_csv_path: Path = output_dir / f"{file_prefix}_latest.csv"

    payload: dict[str, Any] = {
        "kaynak": TARGET_SOURCE_NAME,
        "fetched_at_utc": now.isoformat(timespec="seconds"),
        "count": len(rows),
        "rows": [asdict(row) for row in rows],
    }
    json_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    latest_json_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    csv_field_names: list[str] = [
        "kaynak",
        "altin_adi",
        "alis_fiyati",
        "satis_fiyati",
        "gunluk_degisim_yuzde",
        "guncellenme_tarihi",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=csv_field_names)
        writer.writeheader()
        for row in rows:
            writer.writerow(asdict(row))
    with latest_csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=csv_field_names)
        writer.writeheader()
        for row in rows:
            writer.writerow(asdict(row))

    return json_path, csv_path


def _extract_next_data_payload(html: str) -> dict[str, Any]:
    """Extract and decode the __NEXT_DATA__ JSON payload."""

    match: re.Match[str] | None = NEXT_DATA_PATTERN.search(html)
    if match is None:
        raise GoldPriceFetchError("__NEXT_DATA__ bulunamadı.")

    raw_payload: str = match.group(1)
    try:
        parsed: Any = json.loads(raw_payload)
    except json.JSONDecodeError as error:
        raise GoldPriceFetchError("__NEXT_DATA__ JSON parse edilemedi.") from error

    if not isinstance(parsed, dict):
        raise GoldPriceFetchError("__NEXT_DATA__ nesne formatında değil.")
    return parsed


def _as_dict(value: Any) -> dict[str, Any]:
    """Convert unknown input to a dictionary safely."""

    return value if isinstance(value, dict) else {}


def _as_float(value: Any) -> float:
    """Convert unknown value to float, return 0.0 when conversion fails."""

    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _as_optional_float(value: Any) -> float | None:
    """Convert unknown value to float, return None when conversion fails."""

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
