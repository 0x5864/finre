# Finre MVP Guvenlik Kontrol Listesi

Bu liste ilk surum icin temel guvenlik adimlarini verir.
Hedef: kullanici verisini korumak ve guvenli bir deneyim sunmak.

## 1) Erisim kontrolu

- Her istekte kullanicinin kendi verisine eristigini sunucu tarafinda kontrol et.
- Tahmin edilmesi zor kimlikler kullan (UUID gibi).
- Hesap kapandiginda aktif oturumlari hemen sonlandir.
- Rol bazli yetki varsa, kritik islemlerde rolu tekrar dogrula.

## 2) Girdi dogrulama

- Tum kullanici girdilerini sunucuda dogrula.
- Sadece beklenen alanlari kabul et.
- Metin alanlarinda uzunluk siniri koy.
- Sayisal alanlarda min ve max siniri koy.

## 3) XSS korumasi

- Ekrana yazilan tum metinleri baglama uygun sekilde encode et.
- HTML kabul edilen alanlarda guvenilir sanitizasyon kutuphanesi kullan.
- Hata mesajlarinda ham kullanici girdisi gosterme.

## 4) CSRF korumasi

- Tum POST, PUT, PATCH, DELETE isteklerinde CSRF token kontrol et.
- Session cookie icin `Secure`, `HttpOnly`, `SameSite` ayarla.
- Login ve sifre isteklerinde de CSRF korumasi uygula.

## 5) Oturum ve parola

- Parolalari guclu hash algoritmasi ile sakla.
- Kisa omurlu access token kullan.
- Supheli girislerde kullaniciya uyari ver.

## 6) Veri gizliligi

- Sadece gerekli veriyi topla.
- Acik riza metnini net ve kisa yaz.
- Silme talebinde veriyi geri donulemez sekilde kaldir.
- PII alanlarini loglara yazma.

## 7) API guvenligi

- Oran sinirlama uygula (rate limit).
- CORS ayarini sadece gerekli domainlerle sinirla.
- Hassas endpointlerde audit log tut.

## 8) Uygulama basliklari

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy`

## 9) Yayina cikis oncesi

- Kritik akislarda negatif test yap.
- En az bir temel guvenlik taramasi calistir.
- Yedekleme ve geri donus planini test et.
