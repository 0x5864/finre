# Finre MVP Başlangıç Planı

Bu belge, bireysel finansal ihtiyaç belirleme ürünü için ilk sürüm iskeletidir.
Amaç: kullanıcıyı adım adım tanımak, ihtiyacını bulmak ve net yol göstermek.

## 1) MVP ekran listesi

1. Açılış ekranı
- Kısa vaat: "2-3 dakikada sana uygun finans yol haritası"
- Başla butonu

2. Onay ve gizlilik ekranı
- Hangi verilerin neden sorulduğu
- Açık rıza kutusu
- "Bu içerik yatırım tavsiyesi değildir" notu

3. Profil ekranı
- Yaş aralığı
- Medeni durum
- Çalışma durumu

4. Gelir ekranı
- Aylık net gelir aralığı
- Ek gelir var mı

5. Gider ekranı
- Zorunlu giderler
- Değişken giderler

6. Borç ekranı
- Borç türleri
- Toplam borç
- Aylık borç ödemesi

7. Birikim ve güvenlik ekranı
- Acil durum fonu
- Sigorta durumu

8. Hedef ekranı
- Kısa vadeli hedef
- Orta vadeli hedef
- Hedef tarihi

9. Risk ve davranış ekranı
- Risk tercihi
- Harcama alışkanlığı
- Finansal stres seviyesi

10. Sonuç ekranı
- Finansal durum özeti
- 4 başlıkta skor
- İlk 3 öncelik

11. Yol haritası ekranı
- 30 gün planı
- 60 gün planı
- 90 gün planı

12. Takip ekranı
- Haftalık ilerleme girişi
- Planı güncelle

## 2) 40 soruluk soru bankası

Her soru kısa ve tek konuya odaklı olmalı.

### A) Profil (1-6)
1. Yaş aralığın nedir?
2. Çalışma durumun nedir?
3. Medeni durumun nedir?
4. Kaç kişiye finansal destek veriyorsun?
5. Yaşadığın şehir büyük gider baskısı yaratıyor mu?
6. Gelirin düzenli mi, düzensiz mi?

### B) Gelir (7-12)
7. Aylık net gelir aralığın nedir?
8. Ek gelir kaynağın var mı?
9. Ek gelir ne kadar düzenli?
10. Son 6 ayda gelirinde düşüş oldu mu?
11. Son 6 ayda gelirinde artış oldu mu?
12. Gelecek 6 ay için gelir beklentin nasıl?

### C) Gider (13-20)
13. Aylık kira veya konut giderin ne kadar?
14. Aylık fatura toplamın ne kadar?
15. Aylık gıda giderin ne kadar?
16. Aylık ulaşım giderin ne kadar?
17. Aylık sağlık giderin ne kadar?
18. Aylık eğitim giderin ne kadar?
19. Aylık eğlence ve sosyal harcaman ne kadar?
20. Ay sonunda düzenli para artırabiliyor musun?

### D) Borç (21-28)
21. Kredi kartı borcun var mı?
22. İhtiyaç kredisi borcun var mı?
23. Konut veya taşıt kredin var mı?
24. Toplam borç miktarın yaklaşık ne kadar?
25. Aylık toplam borç ödemen ne kadar?
26. Son 3 ayda geciken ödeme oldu mu?
27. Borçlarının faizi seni zorluyor mu?
28. Yeni borç alma ihtimalin var mı?

### E) Birikim ve güvenlik (29-33)
29. Nakit birikimin var mı?
30. Birikimin kaç aylık temel giderini karşılar?
31. Acil durumlar için ayrı hesap kullanıyor musun?
32. Sağlık veya hayat sigortan var mı?
33. Beklenmedik bir masraf çıkarsa ne yaparsın?

### F) Hedef ve davranış (34-40)
34. En önemli kısa vadeli finans hedefin nedir?
35. En önemli orta vadeli finans hedefin nedir?
36. Bu hedefe ulaşma tarihini belirledin mi?
37. Risk alırken kendini nasıl tanımlarsın?
38. Harcamayı planla mı yoksa anlık mı yaparsın?
39. Finans konuşurken stres seviyen nedir?
40. Finansal karar verirken en çok zorlandığın konu nedir?

## 3) Skorlama matrisi (ilk sürüm)

Skorlar 0 ile 100 arasındadır. Yüksek skor daha iyi durum demektir.

### Ağırlıklar
- Nakit akışı sağlığı: %30
- Borç baskısı: %30
- Güvenlik tamponu: %25
- Hedef netliği ve disiplin: %15

### 3.1 Nakit akışı sağlığı (%30)
- Formül: (Aylık net gelir - aylık toplam gider) / aylık net gelir
- Puan:
  - %20 ve üzeri: 100
  - %10 ile %19: 75
  - %0 ile %9: 50
  - %-1 ile %-10: 25
  - %-10 altı: 0

### 3.2 Borç baskısı (%30)
- Formül: Aylık borç ödemesi / aylık net gelir
- Puan:
  - %0 ile %10: 100
  - %11 ile %25: 75
  - %26 ile %40: 50
  - %41 ile %55: 25
  - %55 üstü: 0
- Son 3 ayda gecikme varsa ek -15 puan

### 3.3 Güvenlik tamponu (%25)
- Ölçüm: Acil durum fonunun kaç aylık temel gideri karşıladığı
- Puan:
  - 6 ay ve üstü: 100
  - 3-5 ay: 75
  - 1-2 ay: 50
  - 1 aydan az: 25
  - Yok: 0

### 3.4 Hedef netliği ve disiplin (%15)
- 4 alt madde, her biri 25 puan:
  - Hedef net mi?
  - Hedef tarihi var mı?
  - Aylık düzenli birikim alışkanlığı var mı?
  - Harcama takibi yapılıyor mu?

### Toplam skor hesabı
Toplam skor =
- (Nakit akışı puanı x 0.30) +
- (Borç baskısı puanı x 0.30) +
- (Güvenlik tamponu puanı x 0.25) +
- (Hedef ve disiplin puanı x 0.15)

## 4) Skora göre yönlendirme kuralları

- 0-39: Acil toparlanma planı
- 40-59: Denge kurma planı
- 60-79: Güçlendirme planı
- 80-100: Büyüme planı

Her seviyede kullanıcıya şunlar verilir:
1. İlk 3 öncelik
2. 30 günlük görev listesi
3. Risk uyarıları
4. Gerekirse uzman yönlendirmesi

## 5) İlk sprint görevleri (1 hafta)

1. Soru akışını form ekranlarına böl
2. Her soruya tek tip cevap formatı tanımla
3. Skor hesap servisinin ilk sürümünü yaz
4. Sonuç ekranı için metin şablonları üret
5. Takip ekranında haftalık 3 metrik seç

## 6) Teknik not

MVP için önce kural tabanlı öneri motoru yeterlidir.
Model tabanlı öneri ikinci aşamada eklenir.
