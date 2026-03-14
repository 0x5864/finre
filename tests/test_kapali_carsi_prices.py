"""Tests for Kapalı Çarşı FX and silver parsing and export helpers."""

from __future__ import annotations

import json
from pathlib import Path
import tempfile
import unittest

from finre.kapali_carsi_prices import (
    MarketPriceFetchError,
    TARGET_SOURCE_NAME,
    _resolve_change_amount,
    extract_fx_rows_from_next_data,
    extract_silver_rows_from_payloads,
    export_market_rows,
    parse_fx_rows_from_html,
)


def _build_doviz_payload() -> dict[str, object]:
    """Create a minimal FX payload sample for tests."""

    return {
        "props": {
            "pageProps": {
                "landing": {
                    "body": [
                        {
                            "groupName": "Multiple - Döviz",
                            "response": {
                                "body": {
                                    "Kapalı Çarşı": [
                                        {
                                            "Döviz Adı": {
                                                "value": "Dolar",
                                                "extra": {
                                                    "value": "2026-03-12T18:20:01.127Z",
                                                },
                                            },
                                            "Alış Fiyatı": {"value": 43.96},
                                            "Satış Fiyatı": {
                                                "value": 43.98,
                                                "extra": {"value": 0.22},
                                            },
                                            "Kapanış": {"value": 43.90},
                                        }
                                    ]
                                }
                            },
                        }
                    ]
                }
            }
        }
    }


def _build_altin_payload_with_silver_row() -> dict[str, object]:
    """Create a minimal gold payload sample that contains one silver row."""

    return {
        "props": {
            "pageProps": {
                "landing": {
                    "body": [
                        {
                            "dynamic_component": {
                                "data": {
                                    "attributes": {
                                        "body": [
                                            {
                                                "groupName": "Multiple - Altın",
                                                "response": {
                                                    "body": {
                                                        "Kapalı Çarşı": [
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "XAG/USD",
                                                                    "extra": {
                                                                        "value": "2026-03-12T18:20:01.127Z"
                                                                    },
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 33.12
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 33.54,
                                                                    "extra": {
                                                                        "value": -0.31
                                                                    },
                                                                },
                                                                "Kapanış": {"value": 33.60},
                                                            }
                                                        ]
                                                    }
                                                },
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
    }


def _build_altin_payload_without_silver_row() -> dict[str, object]:
    """Create a minimal gold payload sample that has no silver row."""

    return {
        "props": {
            "pageProps": {
                "landing": {
                    "body": [
                        {
                            "dynamic_component": {
                                "data": {
                                    "attributes": {
                                        "body": [
                                            {
                                                "groupName": "Multiple - Altın",
                                                "response": {
                                                    "body": {
                                                        "Kapalı Çarşı": [
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "Gram Altın"
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 7242.74
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 7243.577
                                                                },
                                                            }
                                                        ]
                                                    }
                                                },
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
    }


class KapaliCarsiFxParsingTests(unittest.TestCase):
    """Unit tests for Kapalı Çarşı FX parser behavior."""

    def test_extract_fx_rows_returns_only_kapali_carsi(self) -> None:
        """Parser should normalize Kapalı Çarşı FX rows."""

        rows = extract_fx_rows_from_next_data(payload=_build_doviz_payload())
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].kaynak, TARGET_SOURCE_NAME)
        self.assertEqual(rows[0].doviz_adi, "Dolar")
        self.assertAlmostEqual(rows[0].alis_fiyati, 43.96)
        self.assertAlmostEqual(rows[0].satis_fiyati, 43.98)
        self.assertAlmostEqual(rows[0].gunluk_degisim_yuzde or 0.0, 0.22)
        self.assertAlmostEqual(rows[0].gunluk_degisim_tutari or 0.0, 0.08)

    def test_extract_fx_rows_raises_when_source_missing(self) -> None:
        """Parser should fail when requested source is absent."""

        with self.assertRaises(MarketPriceFetchError):
            extract_fx_rows_from_next_data(
                payload=_build_doviz_payload(),
                source_name="Olmayan Kaynak",
            )

    def test_parse_fx_rows_from_html(self) -> None:
        """HTML parser should decode __NEXT_DATA__ and extract rows."""

        payload_json: str = json.dumps(_build_doviz_payload(), ensure_ascii=False)
        html: str = (
            "<html><head></head><body>"
            f'<script id="__NEXT_DATA__" type="application/json">{payload_json}</script>'
            "</body></html>"
        )
        rows = parse_fx_rows_from_html(html=html)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].kaynak, TARGET_SOURCE_NAME)


class KapaliCarsiSilverParsingTests(unittest.TestCase):
    """Unit tests for Kapalı Çarşı silver parser behavior."""

    def test_extract_silver_rows_returns_marked_rows(self) -> None:
        """Parser should keep rows that match silver markers."""

        rows = extract_silver_rows_from_payloads(
            altin_payload=_build_altin_payload_with_silver_row(),
            doviz_payload=_build_doviz_payload(),
        )
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].kaynak, TARGET_SOURCE_NAME)
        self.assertEqual(rows[0].gumus_adi, "XAG/USD")
        self.assertAlmostEqual(rows[0].alis_fiyati, 33.12)
        self.assertAlmostEqual(rows[0].satis_fiyati, 33.54)

    def test_extract_silver_rows_returns_empty_when_no_marker(self) -> None:
        """Parser should return empty rows when silver markers are absent."""

        rows = extract_silver_rows_from_payloads(
            altin_payload=_build_altin_payload_without_silver_row(),
            doviz_payload=_build_doviz_payload(),
        )
        self.assertEqual(rows, [])


class KapaliCarsiMarketExportTests(unittest.TestCase):
    """Unit tests for market JSON and CSV export."""

    def test_export_market_rows_writes_json_and_csv(self) -> None:
        """Export should create both files and include one row."""

        rows = extract_fx_rows_from_next_data(payload=_build_doviz_payload())
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir: Path = Path(temp_dir)
            json_path, csv_path = export_market_rows(
                rows=rows,
                output_dir=output_dir,
                file_prefix="test_doviz",
            )
            latest_json_path: Path = output_dir / "test_doviz_latest.json"
            latest_csv_path: Path = output_dir / "test_doviz_latest.csv"

            self.assertTrue(json_path.exists())
            self.assertTrue(csv_path.exists())
            self.assertTrue(latest_json_path.exists())
            self.assertTrue(latest_csv_path.exists())

            payload = json.loads(json_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["kaynak"], TARGET_SOURCE_NAME)
            self.assertEqual(payload["count"], 1)
            self.assertEqual(payload["rows"][0]["doviz_adi"], "Dolar")


class KapaliCarsiChangeAmountTests(unittest.TestCase):
    """Unit tests for change amount fallback behavior."""

    def test_change_amount_falls_back_to_percent_when_close_diff_is_zero(self) -> None:
        """Percent estimate should be used when close-based change is zero."""

        resolved_amount: float | None = _resolve_change_amount(
            satis_fiyati=44.10,
            gunluk_degisim_yuzde=0.27,
            kapanis_fiyati=44.10,
        )

        self.assertIsNotNone(resolved_amount)
        assert resolved_amount is not None
        self.assertGreater(abs(resolved_amount), 0.0)


if __name__ == "__main__":
    unittest.main()
