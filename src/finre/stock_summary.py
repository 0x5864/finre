"""Fetch and parse the first five stock summary tables from Bigpara."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import UTC, datetime
import html
import json
from pathlib import Path
import re
import time
from typing import Any
import unicodedata

import httpx


BIGPARA_STOCK_SUMMARY_URL: str = "https://bigpara.hurriyet.com.tr/borsa/gunun-ozeti/"
TARGET_SOURCE_NAME: str = "Bigpara"
BIGPARA_REQUEST_HEADERS: tuple[dict[str, str], ...] = (
    {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/136.0.0.0 Safari/537.36"
        ),
        "Accept": (
            "text/html,application/xhtml+xml,application/xml;q=0.9,"
            "image/avif,image/webp,*/*;q=0.8"
        ),
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://bigpara.hurriyet.com.tr/",
    },
    {
        "User-Agent": (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 "
            "Mobile/15E148 Safari/604.1"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.7",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": "https://bigpara.hurriyet.com.tr/",
    },
)
TABLE_ORDER: tuple[str, ...] = (
    "BIST Endeksleri",
    "En Çok İşlem Görenler (TL)",
    "Borsa'da En Çok Artanlar",
    "Borsa'da En Çok Azalanlar",
)
TABLE_PATTERN: re.Pattern[str] = re.compile(
    r"<table[^>]*>(.*?)</table>",
    flags=re.IGNORECASE | re.DOTALL,
)
ROW_PATTERN: re.Pattern[str] = re.compile(
    r"<tr[^>]*>(.*?)</tr>",
    flags=re.IGNORECASE | re.DOTALL,
)
CELL_PATTERN: re.Pattern[str] = re.compile(
    r"<t[hd][^>]*>(.*?)</t[hd]>",
    flags=re.IGNORECASE | re.DOTALL,
)
HEADING_PATTERN: re.Pattern[str] = re.compile(
    r"<h[1-6][^>]*>(.*?)</h[1-6]>",
    flags=re.IGNORECASE | re.DOTALL,
)
CAPTION_PATTERN: re.Pattern[str] = re.compile(
    r"<h3[^>]*class=\"caption\"[^>]*>(.*?)</h3>",
    flags=re.IGNORECASE | re.DOTALL,
)
THEAD_LIST_PATTERN: re.Pattern[str] = re.compile(
    r"<div[^>]*class=\"tHead\"[^>]*>.*?<ul>(.*?)</ul>.*?</div>",
    flags=re.IGNORECASE | re.DOTALL,
)
TBODY_BLOCK_PATTERN: re.Pattern[str] = re.compile(
    r"<div[^>]*class=\"tBody\"[^>]*>(.*?)</div>",
    flags=re.IGNORECASE | re.DOTALL,
)
LIST_ROW_PATTERN: re.Pattern[str] = re.compile(
    r"<ul[^>]*>(.*?)</ul>",
    flags=re.IGNORECASE | re.DOTALL,
)
LIST_CELL_PATTERN: re.Pattern[str] = re.compile(
    r"<li[^>]*>(.*?)</li>",
    flags=re.IGNORECASE | re.DOTALL,
)
TAG_PATTERN: re.Pattern[str] = re.compile(r"<[^>]+>")
WHITESPACE_PATTERN: re.Pattern[str] = re.compile(r"\s+")


class StockSummaryFetchError(RuntimeError):
    """Raised when Bigpara stock summary tables cannot be fetched or parsed."""


@dataclass(frozen=True)
class StockSummaryRow:
    """One generic stock summary table row."""

    cells: list[str]


@dataclass(frozen=True)
class StockSummaryTable:
    """One stock summary table with title, columns, and rows."""

    title: str
    columns: list[str]
    rows: list[StockSummaryRow]


def fetch_stock_summary_tables(
    *,
    timeout_seconds: float = 10.0,
) -> list[StockSummaryTable]:
    """Fetch Bigpara stock summary page and parse the first five tables."""

    html_text: str = _fetch_html(timeout_seconds=timeout_seconds)
    return parse_stock_summary_tables(html_text=html_text)


def parse_stock_summary_tables(*, html_text: str) -> list[StockSummaryTable]:
    """Parse the target stock summary tables from one HTML response body."""

    tables_by_title: dict[str, StockSummaryTable] = {}

    for table_match in TABLE_PATTERN.finditer(html_text):
        table_html: str = table_match.group(1)
        context_start: int = max(0, table_match.start() - 2000)
        context_html: str = html_text[context_start:table_match.start()]
        detected_title: str | None = _extract_table_title(context_html=context_html)
        if detected_title is None:
            continue

        if detected_title in tables_by_title:
            continue

        parsed_table: StockSummaryTable | None = _parse_table_html(
            table_html=table_html,
            title=detected_title,
        )
        if parsed_table is None:
            continue

        tables_by_title[detected_title] = parsed_table
        if len(tables_by_title) == len(TABLE_ORDER):
            break

    ordered_tables: list[StockSummaryTable] = [
        tables_by_title[title] for title in TABLE_ORDER if title in tables_by_title
    ]
    if not ordered_tables:
        ordered_tables = _parse_stock_tables_from_div_blocks(html_text=html_text)
    if not ordered_tables:
        raise StockSummaryFetchError("Bigpara borsa özet tabloları ayrıştırılamadı.")
    return ordered_tables


def _parse_stock_tables_from_div_blocks(*, html_text: str) -> list[StockSummaryTable]:
    """Parse stock summary tables from div-based markup blocks."""

    tables_by_title: dict[str, StockSummaryTable] = {}
    caption_matches: list[re.Match[str]] = list(CAPTION_PATTERN.finditer(html_text))
    if not caption_matches:
        return []

    for index, match in enumerate(caption_matches):
        raw_title: str = _clean_html_text(match.group(1))
        mapped_title: str | None = _map_table_title(raw_title=raw_title)
        if mapped_title is None or mapped_title in tables_by_title:
            continue

        start: int = match.end()
        end: int = caption_matches[index + 1].start() if index + 1 < len(caption_matches) else len(html_text)
        block_html: str = html_text[start:end]

        headers: list[str] = _extract_div_table_headers(block_html=block_html)
        rows: list[StockSummaryRow] = _extract_div_table_rows(block_html=block_html)
        if not headers or not rows:
            continue

        tables_by_title[mapped_title] = StockSummaryTable(
            title=mapped_title,
            columns=headers,
            rows=rows,
        )

        if len(tables_by_title) == len(TABLE_ORDER):
            break

    return [tables_by_title[title] for title in TABLE_ORDER if title in tables_by_title]


def _extract_div_table_headers(*, block_html: str) -> list[str]:
    """Extract column headers from a div-based table block."""

    match: re.Match[str] | None = THEAD_LIST_PATTERN.search(block_html)
    if match is None:
        return []

    header_html: str = match.group(1)
    headers: list[str] = []
    for cell_match in LIST_CELL_PATTERN.finditer(header_html):
        cell_text: str = _clean_html_text(cell_match.group(1))
        headers.append(cell_text)
    return headers


def _extract_div_table_rows(*, block_html: str) -> list[StockSummaryRow]:
    """Extract rows from a div-based table block."""

    body_match: re.Match[str] | None = TBODY_BLOCK_PATTERN.search(block_html)
    if body_match is None:
        return []

    body_html: str = body_match.group(1)
    rows: list[StockSummaryRow] = []
    for row_match in LIST_ROW_PATTERN.finditer(body_html):
        row_html: str = row_match.group(1)
        cells: list[str] = [
            _clean_html_text(cell_match.group(1))
            for cell_match in LIST_CELL_PATTERN.finditer(row_html)
        ]
        if not any(cell for cell in cells):
            continue
        rows.append(StockSummaryRow(cells=cells))
    return rows


def export_stock_summary_tables(
    *,
    tables: list[StockSummaryTable],
    output_dir: Path,
    file_prefix: str = "borsa_bigpara_gunun_ozeti",
    source_name: str = TARGET_SOURCE_NAME,
) -> tuple[Path, Path]:
    """Save parsed stock summary tables as JSON snapshots."""

    output_dir.mkdir(parents=True, exist_ok=True)
    now: datetime = datetime.now(UTC)
    date_str: str = now.strftime("%Y-%m-%d")
    dated_path: Path = output_dir / f"{file_prefix}_{date_str}.json"
    latest_path: Path = output_dir / f"{file_prefix}_latest.json"
    payload: dict[str, Any] = {
        "kaynak": source_name,
        "fetched_at_utc": now.isoformat(),
        "count": len(tables),
        "tables": [asdict(table) for table in tables],
    }

    serialized_payload: str = json.dumps(payload, ensure_ascii=False, indent=2)
    dated_path.write_text(serialized_payload, encoding="utf-8")
    latest_path.write_text(serialized_payload, encoding="utf-8")
    return dated_path, latest_path


def _fetch_html(*, timeout_seconds: float) -> str:
    """Fetch the Bigpara stock summary page as HTML."""

    last_error: Exception | None = None

    for attempt_index, headers in enumerate(BIGPARA_REQUEST_HEADERS, start=1):
        try:
            with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
                response: httpx.Response = client.get(
                    BIGPARA_STOCK_SUMMARY_URL,
                    headers=headers,
                )
                response.raise_for_status()
                return response.text
        except httpx.HTTPError as error:
            last_error = error
            if attempt_index < len(BIGPARA_REQUEST_HEADERS):
                time.sleep(0.35)

    raise StockSummaryFetchError("Bigpara borsa özeti alınamadı.") from last_error


def _extract_table_title(*, context_html: str) -> str | None:
    """Return the nearest supported title before one table block."""

    titles: list[str] = []
    for heading_match in HEADING_PATTERN.finditer(context_html):
        cleaned_heading: str = _clean_html_text(heading_match.group(1))
        mapped_title: str | None = _map_table_title(raw_title=cleaned_heading)
        if mapped_title is not None:
            titles.append(mapped_title)

    if not titles:
        return None
    return titles[-1]


def _map_table_title(*, raw_title: str) -> str | None:
    """Map one raw heading into one supported stock summary table title."""

    normalized_title: str = _normalize_title(raw_title)
    title_map: dict[str, str] = {
        "bist endeksleri": "BIST Endeksleri",
        "borsa da en cok artanlar": "Borsa'da En Çok Artanlar",
        "borsada en cok artanlar": "Borsa'da En Çok Artanlar",
        "borsa da en cok azalanlar": "Borsa'da En Çok Azalanlar",
        "borsada en cok azalanlar": "Borsa'da En Çok Azalanlar",
        "en cok islem gorenler tl": "En Çok İşlem Görenler (TL)",
    }
    return title_map.get(normalized_title)


def _normalize_title(value: str) -> str:
    """Normalize Turkish heading text for stable comparisons."""

    text: str = value.lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    translation_map: dict[int, str] = str.maketrans(
        {
            "ç": "c",
            "ğ": "g",
            "ı": "i",
            "ö": "o",
            "ş": "s",
            "ü": "u",
            "'": " ",
            "(": " ",
            ")": " ",
        }
    )
    text = text.translate(translation_map)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return WHITESPACE_PATTERN.sub(" ", text).strip()


def _parse_table_html(*, table_html: str, title: str) -> StockSummaryTable | None:
    """Parse one HTML table block into a stock summary table object."""

    parsed_rows: list[list[str]] = []
    for row_match in ROW_PATTERN.finditer(table_html):
        cells: list[str] = [
            _clean_html_text(cell_html)
            for cell_html in CELL_PATTERN.findall(row_match.group(1))
        ]
        if any(cell for cell in cells):
            parsed_rows.append(cells)

    if len(parsed_rows) < 2:
        return None

    header_row: list[str] = parsed_rows[0]
    body_rows: list[StockSummaryRow] = [
        StockSummaryRow(cells=row) for row in parsed_rows[1:] if len(row) == len(header_row)
    ]
    if not body_rows:
        return None

    return StockSummaryTable(title=title, columns=header_row, rows=body_rows[:5])


def _clean_html_text(value: str) -> str:
    """Strip tags and normalize one HTML fragment into plain text."""

    cleaned_value: str = TAG_PATTERN.sub(" ", value)
    cleaned_value = html.unescape(cleaned_value)
    cleaned_value = cleaned_value.replace("\xa0", " ")
    return WHITESPACE_PATTERN.sub(" ", cleaned_value).strip()
