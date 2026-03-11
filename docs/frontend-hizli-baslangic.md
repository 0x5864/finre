# Finre Frontend Hizli Baslangic

Bu ekran adim adim soru sorar.
Cevaplara gore skor ve yol haritasi verir.
Akis KVKK/acik riza adimi ile baslar.

## 1) Statik arayuzu ac

Proje kokunde sunlari calistir:

- `python3 -m http.server 4173`
- Tarayicida `http://127.0.0.1:4173/web/` adresini ac

## 2) API baglantisi (opsiyonel)

Eger API calisiyorsa, sol paneldeki `API adresi` alanina API adresini yaz.
Ornek: `http://127.0.0.1:8000`

API kapaliysa ekran yine calisir.
Bu durumda yerel fallback hesap kullanir.

API aciksa arayuz otomatik olarak bir anonim oturum acar.
Ilerledikce cevaplar bu oturuma kaydedilir.

## 3) Sonuc ekrani

Sonuc ekraninda sunlar gorunur:

- Toplam skor
- 4 alt skor
- Ilk 3 oncelik
- 30-60-90 gun adimlari

## 4) Not

Bu ekran MVP icindir.
Metinler ve kurallar kolayca degistirilebilir.
