"""Tests for Enuygun gold price parsing and export helpers."""

from __future__ import annotations

import json
from pathlib import Path
import tempfile
import unittest
from typing import Any

from finre.gold_prices import (
    GoldPriceFetchError,
    ONS_USD_DISPLAY_NAME,
    TARGET_SOURCE_NAME,
    extract_gold_rows_from_next_data,
    export_gold_rows,
    parse_gold_rows_from_html,
)


def _build_sample_payload() -> dict[str, Any]:
    """Create a minimal __NEXT_DATA__ payload for tests."""

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
                                                                    "value": "Gram Altın",
                                                                    "extra": {
                                                                        "value": "2026-03-12T18:20:01.127Z"
                                                                    },
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 7242.74
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 7243.577,
                                                                    "extra": {
                                                                        "value": -1.27
                                                                    },
                                                                },
                                                            }
                                                        ],
                                                        "Altınkaynak": [],
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


def _build_filtered_payload_with_ons() -> dict[str, Any]:
    """Create a payload with removable rows and the data needed for Ons/USD."""

    return {
        "props": {
            "pageProps": {
                "landing": {
                    "headline": [
                        {
                            "dynamic_component": {
                                "data": {
                                    "attributes": {
                                        "body": [
                                            {
                                                "response": {
                                                    "data": {
                                                        "group": {
                                                            "data": {
                                                                "attributes": {
                                                                    "symbols": {
                                                                        "data": [
                                                                            {
                                                                                "attributes": {
                                                                                    "symbol": "XAUTRY",
                                                                                    "name": "Altın/Ons",
                                                                                    "buying": 221625.73,
                                                                                    "selling": 222249.88,
                                                                                    "dataUpdatedAt": "2026-03-13T20:59:45.626Z",
                                                                                    "dailyChangePercent": -0.98,
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "response": {
                                                    "data": {
                                                        "currency": {
                                                            "data": {
                                                                "attributes": {
                                                                    "symbols": {
                                                                        "data": [
                                                                            {
                                                                                "attributes": {
                                                                                    "symbol": "USDTRY:GB",
                                                                                    "name": "Dolar",
                                                                                    "buying": 44.23,
                                                                                    "selling": 44.24,
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                        ]
                                    }
                                }
                            }
                        }
                    ],
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
                                                                    "value": "Gram Altın",
                                                                    "extra": {
                                                                        "value": "2026-03-13T10:27:59.487Z"
                                                                    },
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 7234.986
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 7235.796,
                                                                    "extra": {
                                                                        "value": 0.41
                                                                    },
                                                                },
                                                            },
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "Çeyrek Altın",
                                                                    "extra": {
                                                                        "value": "2026-03-13T10:02:17.822Z"
                                                                    },
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 11627.35
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 11898.89,
                                                                    "extra": {
                                                                        "value": -1.17
                                                                    },
                                                                },
                                                            },
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "Cumhuriyet Altını",
                                                                    "extra": {
                                                                        "value": "2026-03-13T09:24:31.280Z"
                                                                    },
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 48164.0
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 48892.0,
                                                                    "extra": {
                                                                        "value": -1.31
                                                                    },
                                                                },
                                                            },
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "Ata Altın"
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 47962.83
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 49196.63,
                                                                    "extra": {
                                                                        "value": -1.17
                                                                    },
                                                                },
                                                            },
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "14 Ayar Bilezik"
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 4142.24
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 4148.24,
                                                                    "extra": {
                                                                        "value": -1.17
                                                                    },
                                                                },
                                                            },
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "18 Ayar Bilezik"
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 5304.98
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 5312.65,
                                                                    "extra": {
                                                                        "value": -1.17
                                                                    },
                                                                },
                                                            },
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "22 Ayar Bilezik"
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 6627.59
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 6637.18,
                                                                    "extra": {
                                                                        "value": -1.17
                                                                    },
                                                                },
                                                            },
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "Yarım Altın",
                                                                    "extra": {
                                                                        "value": "2026-03-13T10:02:17.822Z"
                                                                    },
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 23182.03
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 23797.78,
                                                                    "extra": {
                                                                        "value": -1.17
                                                                    },
                                                                },
                                                            },
                                                            {
                                                                "Altın Adı": {
                                                                    "value": "Gram Altın (Serb.)"
                                                                },
                                                                "Alış Fiyatı": {
                                                                    "value": 7267.095
                                                                },
                                                                "Satış Fiyatı": {
                                                                    "value": 7277.608,
                                                                    "extra": {
                                                                        "value": -1.17
                                                                    },
                                                                },
                                                            },
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


class GoldPriceParsingTests(unittest.TestCase):
    """Unit tests for gold parser behavior."""

    def test_extract_rows_returns_only_kapali_carsi(self) -> None:
        """Parser should keep only Kapalı Çarşı rows."""

        rows = extract_gold_rows_from_next_data(payload=_build_sample_payload())
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].kaynak, TARGET_SOURCE_NAME)
        self.assertEqual(rows[0].altin_adi, "Gram Altın")
        self.assertAlmostEqual(rows[0].alis_fiyati, 7242.74)
        self.assertAlmostEqual(rows[0].satis_fiyati, 7243.577)
        self.assertAlmostEqual(rows[0].gunluk_degisim_yuzde or 0.0, -1.27)

    def test_extract_rows_raises_when_source_missing(self) -> None:
        """Parser should fail when requested source is absent."""

        with self.assertRaises(GoldPriceFetchError):
            extract_gold_rows_from_next_data(
                payload=_build_sample_payload(),
                source_name="Olmayan Kaynak",
            )

    def test_parse_rows_from_html(self) -> None:
        """HTML parser should decode __NEXT_DATA__ and extract rows."""

        payload_json: str = json.dumps(_build_sample_payload(), ensure_ascii=False)
        html: str = (
            "<html><head></head><body>"
            f'<script id="__NEXT_DATA__" type="application/json">{payload_json}</script>'
            "</body></html>"
        )
        rows = parse_gold_rows_from_html(html=html)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].kaynak, TARGET_SOURCE_NAME)

    def test_extract_rows_filters_reorders_and_adds_ons_usd(self) -> None:
        """Parser should hide selected rows, move yarim altin, and append Ons/USD."""

        rows = extract_gold_rows_from_next_data(
            payload=_build_filtered_payload_with_ons()
        )

        self.assertEqual(
            [row.altin_adi for row in rows],
            [
                "Gram Altın",
                "Çeyrek Altın",
                "Yarım Altın",
                "Cumhuriyet Altını",
                ONS_USD_DISPLAY_NAME,
            ],
        )
        self.assertAlmostEqual(rows[-1].alis_fiyati, 221625.73 / 44.23, places=4)
        self.assertAlmostEqual(rows[-1].satis_fiyati, 222249.88 / 44.24, places=4)
        self.assertEqual(rows[-1].kaynak, "ENUYGUN Finans")


class GoldPriceExportTests(unittest.TestCase):
    """Unit tests for JSON and CSV export."""

    def test_export_rows_writes_json_and_csv(self) -> None:
        """Export should create both files and include one row."""

        rows = extract_gold_rows_from_next_data(payload=_build_sample_payload())
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir: Path = Path(temp_dir)
            json_path, csv_path = export_gold_rows(
                rows=rows,
                output_dir=output_dir,
                file_prefix="test_altin",
            )
            latest_json_path: Path = output_dir / "test_altin_latest.json"
            latest_csv_path: Path = output_dir / "test_altin_latest.csv"

            self.assertTrue(json_path.exists())
            self.assertTrue(csv_path.exists())
            self.assertTrue(latest_json_path.exists())
            self.assertTrue(latest_csv_path.exists())

            payload = json.loads(json_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["kaynak"], TARGET_SOURCE_NAME)
            self.assertEqual(payload["count"], 1)
            self.assertEqual(payload["rows"][0]["altin_adi"], "Gram Altın")


if __name__ == "__main__":
    unittest.main()
