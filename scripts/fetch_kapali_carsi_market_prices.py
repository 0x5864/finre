"""CLI tool to fetch Kapalı Çarşı gold, FX, and silver prices and export files."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys


PROJECT_ROOT: Path = Path(__file__).resolve().parents[1]
SRC_DIR: Path = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from finre.kapali_carsi_prices import (  # noqa: E402
    MarketPriceFetchError,
    TARGET_SOURCE_NAME,
    export_market_rows,
    fetch_kapali_carsi_fx_prices,
    fetch_kapali_carsi_silver_prices,
)
from finre.gold_prices import (  # noqa: E402
    export_gold_rows,
    fetch_gold_prices,
)


def build_parser() -> argparse.ArgumentParser:
    """Build command line parser."""

    parser = argparse.ArgumentParser(
        description="Enuygun Finans kaynağından Kapalı Çarşı altın, döviz ve gümüş verilerini çek."
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "data",
        help="Çıktı dosyalarının yazılacağı klasör (varsayılan: data).",
    )
    parser.add_argument(
        "--gold-prefix",
        type=str,
        default="altin_kapali_carsi",
        help="Altın dosyaları için ad ön eki.",
    )
    parser.add_argument(
        "--fx-prefix",
        type=str,
        default="doviz_kapali_carsi",
        help="Döviz dosyaları için ad ön eki.",
    )
    parser.add_argument(
        "--silver-prefix",
        type=str,
        default="gumus_kapali_carsi",
        help="Gümüş dosyaları için ad ön eki.",
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
        gold_rows = fetch_gold_prices(
            timeout_seconds=args.timeout,
            source_name=TARGET_SOURCE_NAME,
        )
        gold_json_path, gold_csv_path = export_gold_rows(
            rows=gold_rows,
            output_dir=args.output_dir,
            file_prefix=args.gold_prefix,
        )

        fx_rows = fetch_kapali_carsi_fx_prices(
            timeout_seconds=args.timeout,
            source_name=TARGET_SOURCE_NAME,
        )
        fx_json_path, fx_csv_path = export_market_rows(
            rows=fx_rows,
            output_dir=args.output_dir,
            file_prefix=args.fx_prefix,
            source_name=TARGET_SOURCE_NAME,
        )

        silver_rows = fetch_kapali_carsi_silver_prices(
            timeout_seconds=args.timeout,
            source_name=TARGET_SOURCE_NAME,
        )
        silver_json_path, silver_csv_path = export_market_rows(
            rows=silver_rows,
            output_dir=args.output_dir,
            file_prefix=args.silver_prefix,
            source_name=TARGET_SOURCE_NAME,
        )
    except MarketPriceFetchError as error:
        print(f"Hata: {error}")
        return 1

    print(f"Kaynak: {TARGET_SOURCE_NAME}")
    print(f"Altın satır sayısı: {len(gold_rows)}")
    print(f"Altın JSON: {gold_json_path}")
    print(f"Altın CSV: {gold_csv_path}")
    print(f"Altın JSON (latest): {args.output_dir / f'{args.gold_prefix}_latest.json'}")
    print(f"Altın CSV (latest): {args.output_dir / f'{args.gold_prefix}_latest.csv'}")
    print(f"Döviz satır sayısı: {len(fx_rows)}")
    print(f"Döviz JSON: {fx_json_path}")
    print(f"Döviz CSV: {fx_csv_path}")
    print(f"Döviz JSON (latest): {args.output_dir / f'{args.fx_prefix}_latest.json'}")
    print(f"Döviz CSV (latest): {args.output_dir / f'{args.fx_prefix}_latest.csv'}")
    print(f"Gümüş satır sayısı: {len(silver_rows)}")
    print(f"Gümüş JSON: {silver_json_path}")
    print(f"Gümüş CSV: {silver_csv_path}")
    print(f"Gümüş JSON (latest): {args.output_dir / f'{args.silver_prefix}_latest.json'}")
    print(f"Gümüş CSV (latest): {args.output_dir / f'{args.silver_prefix}_latest.csv'}")
    if len(silver_rows) == 0:
        print("Not: Kapalı Çarşı kaynağında gümüş satırı bulunamadı.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
