# Finre API Hizli Baslangic

Bu API, soru akisini ve finansal degerlendirmeyi sunar.

## 1) Kurulum

- `python3 -m venv .venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`

## 2) Calistirma

- `PYTHONPATH=src python3 -m finre.run_api`

Sunucu: `http://127.0.0.1:8000`

## 3) Uclar

- `GET /health`
- `GET /api/v1/questions`
- `POST /api/v1/assessment`
- `POST /api/v1/sessions`
- `PUT /api/v1/sessions/{session_id}/answers`
- `GET /api/v1/sessions/{session_id}`
- `POST /api/v1/sessions/{session_id}/assessment`

## 4) Assessment icin zorunlu alanlar

- `monthly_net_income`
- `monthly_total_expense`
- `monthly_debt_payment`
- `emergency_fund_months`
- `had_recent_payment_delay`
- `goal_is_clear`
- `has_goal_date`
- `has_monthly_saving_habit`
- `tracks_expenses`

## 5) Cevap icerigi

- `scores`: 4 alt skor ve `total_score`
- `guidance`: seviye, ilk 3 oncelik, 30-60-90 gun adimlari
- `disclaimer`: yatirim tavsiyesi uyarisi

## 6) Session akis ozeti

1. `POST /api/v1/sessions` ile bir oturum ac.
2. Wizard ilerledikce cevaplari `PUT /answers` ile kaydet.
3. Son adimda `POST /assessment` cagir ve sonucu al.
