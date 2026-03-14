"""CLI tool to fetch Kapalı Çarşı gold prices and export JSON/CSV files."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys


PROJECT_ROOT: Path = Path(__file__).resolve().parents[1]
SRC_DIR: Path = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from finre.gold_prices import (  # noqa: E402
    GoldPriceFetchError,
    TARGET_SOURCE_NAME,
    export_gold_rows,
    fetch_gold_prices,
)


def build_parser() -> argparse.ArgumentParser:
    """Build command line parser."""

    parser = argparse.ArgumentParser(
        description="Enuygun Finans kaynağından Kapalı Çarşı altın fiyatlarını çek."
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "data",
        help="Çıktı dosyalarının yazılacağı klasör (varsayılan: data).",
    )
    parser.add_argument(
        "--prefix",
        type=str,
        default="altin_kapali_carsi",
        help="Üretilecek dosyaların ad ön eki.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=10.0,
        help="HTTP istek zaman aşımı (saniye).",
    )
    return parser


def main() -> int:
    """Run CLI flow and return exit code."""

    parser: argparse.ArgumentParser = build_parser()
    args: argparse.Namespace = parser.parse_args()

    try:
        rows = fetch_gold_prices(
            timeout_seconds=args.timeout,
            source_name=TARGET_SOURCE_NAME,
        )
        json_path, csv_path = export_gold_rows(
            rows=rows,
            output_dir=args.output_dir,
            file_prefix=args.prefix,
        )
    except GoldPriceFetchError as error:
        print(f"Hata: {error}")
        return 1

    print(f"Kaynak: {TARGET_SOURCE_NAME}")
    print(f"Satır sayısı: {len(rows)}")
    print(f"JSON: {json_path}")
    print(f"CSV: {csv_path}")
    print(f"JSON (latest): {args.output_dir / f'{args.prefix}_latest.json'}")
    print(f"CSV (latest): {args.output_dir / f'{args.prefix}_latest.csv'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
