import { normalizeInvestmentSectionKey } from "./investment-route.mjs";

const FALLBACK_QUESTIONS = [
  {
    id: "q07",
    section: "gelir",
    prompt: "Aylık net gelir tutarın nedir?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q13",
    section: "gider",
    prompt: "Aylık kira veya konut giderin ne kadar?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q14",
    section: "gider",
    prompt: "Aylık fatura toplamın ne kadar?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q15",
    section: "gider",
    prompt: "Aylık gıda giderin ne kadar?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q16",
    section: "gider",
    prompt: "Aylık ulaşım giderin ne kadar?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q17",
    section: "gider",
    prompt: "Aylık sağlık giderin ne kadar?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q18",
    section: "gider",
    prompt: "Aylık eğitim giderin ne kadar?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q19",
    section: "gider",
    prompt: "Aylık eğlence ve sosyal harcaman ne kadar?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q20",
    section: "davranis",
    prompt: "Ay sonunda düzenli para artırabiliyor musun?",
    answer_type: "single_choice",
    required: true,
    options: ["Her ay", "Bazı aylar", "Nadiren", "Hiç"],
  },
  {
    id: "q25",
    section: "borc",
    prompt: "Aylık toplam borç ödemen ne kadar?",
    answer_type: "currency",
    required: true,
  },
  {
    id: "q26",
    section: "borc",
    prompt: "Son 3 ayda geciken ödeme oldu mu?",
    answer_type: "single_choice",
    required: true,
    options: ["Evet", "Hayır"],
  },
  {
    id: "q30",
    section: "birikim",
    prompt: "Birikimin kaç aylık temel giderini karşılar?",
    answer_type: "number",
    required: true,
  },
  {
    id: "q34",
    section: "hedef",
    prompt: "En önemli kısa vadeli finans hedefin nedir?",
    answer_type: "text",
    required: true,
  },
  {
    id: "q36",
    section: "hedef",
    prompt: "Bu hedefe ulaşma tarihi belirledin mi?",
    answer_type: "single_choice",
    required: true,
    options: ["Evet", "Hayır"],
  },
  {
    id: "q38",
    section: "davranis",
    prompt: "Harcamayı planlı mı yoksa anlık mı yaparsın?",
    answer_type: "single_choice",
    required: true,
    options: ["Planlı", "Karışık", "Anlık"],
  },
];

const SECTION_LABELS = {
  profil: "Profil",
  gelir: "Gelir",
  gider: "Gider",
  borc: "Borç",
  birikim: "Birikim",
  hedef: "Hedef",
  davranis: "Davranış",
};

const DEFAULT_API_BASE = "http://127.0.0.1:8000";
const MAX_INPUT_NUMBER = 1_000_000_000;
const FETCH_TIMEOUT_MS = 2500;
const MARKET_REFRESH_INTERVAL_MS = 30_000;
const EMBEDDED_GOLD_FALLBACK_PAYLOAD = Object.freeze({
  kaynak: "Kapalı Çarşı",
  fetched_at_utc: "2026-03-15T10:16:52+00:00",
  count: 5,
  rows: [
    {
      kaynak: "Kapalı Çarşı",
      altin_adi: "Gram Altın",
      alis_fiyati: 7234.986,
      satis_fiyati: 7235.796,
      gunluk_degisim_yuzde: 0.41,
      guncellenme_tarihi: "2026-03-13T10:27:59.487Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      altin_adi: "Çeyrek Altın",
      alis_fiyati: 11627.35,
      satis_fiyati: 11898.89,
      gunluk_degisim_yuzde: -1.17,
      guncellenme_tarihi: "2026-03-13T10:02:17.822Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      altin_adi: "Yarım Altın",
      alis_fiyati: 23182.03,
      satis_fiyati: 23797.78,
      gunluk_degisim_yuzde: -1.17,
      guncellenme_tarihi: "2026-03-13T10:02:17.822Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      altin_adi: "Cumhuriyet Altını",
      alis_fiyati: 48164.0,
      satis_fiyati: 48892.0,
      gunluk_degisim_yuzde: -1.31,
      guncellenme_tarihi: "2026-03-13T09:24:31.280Z",
    },
    {
      kaynak: "ENUYGUN Finans",
      altin_adi: "Altın (Ons/USD)",
      alis_fiyati: 5010.75582184038,
      satis_fiyati: 5023.731464737793,
      gunluk_degisim_yuzde: -0.98,
      guncellenme_tarihi: "2026-03-13T20:59:45.626Z",
    },
  ],
});
const EMBEDDED_FX_FALLBACK_PAYLOAD = Object.freeze({
  kaynak: "Kapalı Çarşı",
  fetched_at_utc: "2026-03-13T10:30:37+00:00",
  count: 10,
  rows: [
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "Dolar",
      alis_fiyati: 44.09,
      satis_fiyati: 44.1,
      gunluk_degisim_yuzde: 0.27,
      gunluk_degisim_tutari: 0.11874937668295615,
      guncellenme_tarihi: "2026-03-13T10:02:37.031Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "Euro",
      alis_fiyati: 50.45,
      satis_fiyati: 50.5,
      gunluk_degisim_yuzde: -0.3,
      gunluk_degisim_tutari: -0.15195586760280833,
      guncellenme_tarihi: "2026-03-13T10:02:38.207Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "Sterlin",
      alis_fiyati: 58.3128,
      satis_fiyati: 58.6051,
      gunluk_degisim_yuzde: -0.36,
      gunluk_degisim_tutari: -0.2117406262545174,
      guncellenme_tarihi: "2026-03-13T10:26:04.210Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "İsviçre Frangı",
      alis_fiyati: 55.7793,
      satis_fiyati: 56.0589,
      gunluk_degisim_yuzde: -0.03,
      gunluk_degisim_tutari: -0.016822716815042327,
      guncellenme_tarihi: "2026-03-13T10:25:58.194Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "Japon Yeni",
      alis_fiyati: 27.5775,
      satis_fiyati: 27.7158,
      gunluk_degisim_yuzde: 0.19,
      gunluk_degisim_tutari: 0.05256015570416395,
      guncellenme_tarihi: "2026-03-13T10:27:51.371Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "Suudi Arabistan Riyali",
      alis_fiyati: 11.7211,
      satis_fiyati: 11.7799,
      gunluk_degisim_yuzde: 0.28,
      gunluk_degisim_tutari: 0.0328916234543275,
      guncellenme_tarihi: "2026-03-13T10:23:48.779Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "BAE Dirhemi",
      alis_fiyati: 11.9768,
      satis_fiyati: 12.0368,
      gunluk_degisim_yuzde: 0.28,
      gunluk_degisim_tutari: 0.03360893498205009,
      guncellenme_tarihi: "2026-03-13T10:02:17.820Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "Katar Riyali",
      alis_fiyati: 12.0238,
      satis_fiyati: 12.084,
      gunluk_degisim_yuzde: -0.18,
      gunluk_degisim_tutari: -0.02179042276097043,
      guncellenme_tarihi: "2026-03-13T10:02:17.821Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "Kuveyt Dinarı",
      alis_fiyati: 143.1935,
      satis_fiyati: 143.9113,
      gunluk_degisim_yuzde: 0.26,
      gunluk_degisim_tutari: 0.37319906243766354,
      guncellenme_tarihi: "2026-03-13T10:27:21.496Z",
    },
    {
      kaynak: "Kapalı Çarşı",
      doviz_adi: "Gürcistan Larisi",
      alis_fiyati: 16.2006,
      satis_fiyati: 16.2819,
      gunluk_degisim_yuzde: 0.28,
      gunluk_degisim_tutari: 0.04546202632628393,
      guncellenme_tarihi: "2026-03-13T10:02:17.821Z",
    },
  ],
});
const LOAN_TYPE_CONFIG = {
  need: {
    title: "İhtiyaç Kredisi",
    defaultPrincipal: 50_000,
    defaultInstallment: 5_000,
    defaultRate: 2.49,
    terms: [6, 12, 24, 36],
    defaultTerm: 12,
    taxes: {
      bsmv: 0.15,
      kkdf: 0.15,
    },
  },
  housing: {
    title: "Konut Kredisi",
    defaultPrincipal: 1_000_000,
    defaultInstallment: 30_000,
    defaultRate: 2.89,
    terms: [12, 24, 36, 48, 60, 84, 120],
    defaultTerm: 120,
    taxes: {
      bsmv: 0,
      kkdf: 0,
    },
  },
  vehicle: {
    title: "Taşıt Kredisi",
    defaultPrincipal: 400_000,
    defaultInstallment: 12_000,
    defaultRate: 3.19,
    terms: [6, 12, 24, 36, 48],
    defaultTerm: 24,
    taxes: {
      bsmv: 0.15,
      kkdf: 0.15,
    },
  },
  deposit: {},
  compound: {},
  real: {},
};
const ROUTE_HASH = Object.freeze({
  home: "#anasayfa",
  loan: "#kredi",
  calculation: "#hesaplama",
  investment: "#yatirim",
  investmentFx: "#yatirim-doviz",
  investmentStock: "#yatirim-borsa",
  investmentFund: "#yatirim-fon",
  investmentGold: "#yatirim-altin",
  investmentSilver: "#yatirim-mevduat",
});
const CALCULATION_ROUTE_PREFIX = "#hesaplama-";
const LOAN_ROUTE_PREFIX = "#kredi-";
const INVESTMENT_ROUTE_PREFIX = "#yatirim-";
const LEGACY_INVESTMENT_SILVER_HASH = "#yatirim-gumus";
const LEGACY_INVESTMENT_DEPOSIT_HASH = "#yatirim-mevduar";
const BANK_APP_REDIRECT_ROUTE_PREFIX = "#mobil-yonlendir";
const BANK_ROUTE_PREFIX = "#banka-";
const DEPOSIT_OFFER_CATALOG = Object.freeze([
  {
    bank: "ON Dijital",
    product: "ON Plus Vadeli Hesap",
    annualRate: 44.75,
    accountType: "new",
    bankType: "digital",
    badge: "Yeni Müşteri",
    note: "Dijital açılışta yüksek oran ve hızlı müşteri edinimi sunar.",
    actionLabel: "Teklifi İncele",
  },
  {
    bank: "CEPTETEB",
    product: "Marifetli Hesap",
    annualRate: 44.0,
    accountType: "new",
    bankType: "digital",
    badge: "Sponsor",
    note: "Hoş geldin oranı ile kısa vadede güçlü net getiri hedefler.",
    actionLabel: "Hemen Başvur",
  },
  {
    bank: "Fibabanka",
    product: "Kiraz Vadeli Hesap",
    annualRate: 43.75,
    accountType: "standard",
    bankType: "traditional",
    badge: "Standart",
    note: "Klasik vadeli mevduat isteyenler için sade bir yapı sunar.",
    actionLabel: "Detayı Gör",
  },
  {
    bank: "ING",
    product: "e-Turuncu Hesap",
    annualRate: 42.5,
    accountType: "new",
    bankType: "digital",
    badge: "Yeni Müşteri",
    note: "Turuncu müşteri kampanyası ile dijital kanalda oran avantajı sunar.",
    actionLabel: "Oranı Gör",
  },
  {
    bank: "Odea",
    product: "Oksijen Hesap",
    annualRate: 43.25,
    accountType: "daily",
    bankType: "traditional",
    badge: "Günlük Kazandıran",
    note: "Paraya erişimi esnek tutarken günlük kazanç yapısını korur.",
    actionLabel: "İncele",
  },
  {
    bank: "Akbank",
    product: "Vadeli TL Mevduat",
    annualRate: 39.5,
    accountType: "standard",
    bankType: "traditional",
    badge: "Standart",
    note: "Şube ve mobil bankacılığı birlikte kullananlar için klasik seçenek.",
    actionLabel: "Detayı Gör",
  },
]);
const LOAN_OFFER_CATALOG = Object.freeze({
  need: [
    {
      bank: "Akbank",
      product: "Direkt İhtiyaç Kredisi",
      monthlyRate: 2.99,
      badge: "Hızlı Başvuru",
      note: "Dijital başvuruda hızlı ön değerlendirme ile öne çıkar.",
      actionLabel: "Teklifi İncele",
    },
    {
      bank: "QNB",
      product: "QNB İhtiyaç Kredisi",
      monthlyRate: 3.09,
      badge: "Online",
      note: "Uygulama ve internet şube üzerinden kolay başvuru sunar.",
      actionLabel: "Hemen Başvur",
    },
    {
      bank: "ING",
      product: "Turuncu İhtiyaç Kredisi",
      monthlyRate: 3.18,
      badge: "Dijital",
      note: "Dijital müşteri akışında sade ve hızlı kredi deneyimi verir.",
      actionLabel: "Oranı Gör",
    },
    {
      bank: "DenizBank",
      product: "Hazır İhtiyaç Kredisi",
      monthlyRate: 3.24,
      badge: "Şubesiz",
      note: "Mobil ve internet bankacılığı kullananlar için pratik seçenektir.",
      actionLabel: "Detayı Gör",
    },
    {
      bank: "İş Bankası",
      product: "Anında İhtiyaç Kredisi",
      monthlyRate: 3.32,
      badge: "Klasik",
      note: "Geniş kanal ağı ile standart kredi arayanlar için uygundur.",
      actionLabel: "İncele",
    },
    {
      bank: "Garanti BBVA",
      product: "BBVA İhtiyaç Kredisi",
      monthlyRate: 3.36,
      badge: "Mobil",
      note: "Mobil akışta güçlü kullanıcı deneyimi ile öne çıkar.",
      actionLabel: "Başvur",
    },
  ],
  housing: [
    {
      bank: "Akbank",
      product: "Akbank Konut Kredisi",
      monthlyRate: 2.84,
      badge: "Masraflı",
      note: "Uzun vadede dengeli taksit isteyenler için örnek ürün.",
      actionLabel: "Teklifi İncele",
    },
    {
      bank: "Ziraat Bankası",
      product: "Ziraat Konut Kredisi",
      monthlyRate: 2.79,
      badge: "Kamu",
      note: "Kamu bankası seçeneği arayanlar için örneklenmiştir.",
      actionLabel: "Detayı Gör",
    },
    {
      bank: "Vakıfbank",
      product: "Vakıfbank SarıPanjur",
      monthlyRate: 2.82,
      badge: "Kamu",
      note: "Uzun vade ve düzenli gelir dengesine uygun klasik yapı sunar.",
      actionLabel: "İncele",
    },
    {
      bank: "İş Bankası",
      product: "İş Bankası Konut Kredisi",
      monthlyRate: 2.88,
      badge: "Standart",
      note: "Masraf ve taksit dengesini birlikte görmek isteyenler için uygun.",
      actionLabel: "Başvur",
    },
    {
      bank: "Garanti BBVA",
      product: "Garanti BBVA Konut Kredisi",
      monthlyRate: 2.91,
      badge: "Dijital",
      note: "Başvuruyu dijitalden tamamlamak isteyenler için örnek yapı sunar.",
      actionLabel: "Oranı Gör",
    },
    {
      bank: "Yapı Kredi",
      product: "Yapı Kredi Konut Kredisi",
      monthlyRate: 2.95,
      badge: "Klasik",
      note: "Standart mortgage akışını tercih edenler için yer verildi.",
      actionLabel: "Detayı Gör",
    },
  ],
  vehicle: [
    {
      bank: "Akbank",
      product: "Akbank Taşıt Kredisi",
      monthlyRate: 3.15,
      badge: "Yeni Araç",
      note: "Yeni araç finansmanında hızlı dijital ön başvuru sunar.",
      actionLabel: "Teklifi İncele",
    },
    {
      bank: "QNB",
      product: "QNB Taşıt Kredisi",
      monthlyRate: 3.19,
      badge: "Online",
      note: "Uygulama üzerinden takip edilebilir kredi süreci sağlar.",
      actionLabel: "Hemen Başvur",
    },
    {
      bank: "İş Bankası",
      product: "İş Bankası Taşıt Kredisi",
      monthlyRate: 3.24,
      badge: "Standart",
      note: "Araç finansmanında klasik banka akışını tercih edenler içindir.",
      actionLabel: "İncele",
    },
    {
      bank: "Garanti BBVA",
      product: "Garanti BBVA Taşıt Kredisi",
      monthlyRate: 3.27,
      badge: "Mobil",
      note: "Mobil müşteriler için hızlı teklif akışını destekler.",
      actionLabel: "Başvur",
    },
    {
      bank: "TEB",
      product: "CEPTETEB Taşıt Kredisi",
      monthlyRate: 3.31,
      badge: "CEPTETEB",
      note: "Dijital kanal avantajı ile taşıt finansmanında esnek akış sağlar.",
      actionLabel: "Oranı Gör",
    },
    {
      bank: "ING",
      product: "ING Taşıt Kredisi",
      monthlyRate: 3.35,
      badge: "Dijital",
      note: "Kısa sürede ön değerlendirme görmek isteyenler için uygundur.",
      actionLabel: "Detayı Gör",
    },
  ],
});
const LOAN_RATES_PAGE_DATA = Object.freeze({
  need: {
    title: "İhtiyaç Kredisi Banka Karşılaştırması",
    dateLabel: "Güncelleme: 13 Mart 2026",
  },
  housing: {
    title: "Konut Kredisi Banka Karşılaştırması",
    dateLabel: "Güncelleme: 13 Mart 2026",
  },
  vehicle: {
    title: "Taşıt Kredisi Banka Karşılaştırması",
    dateLabel: "Güncelleme: 13 Mart 2026",
  },
  kobi: {
    title: "KOBİ Kredisi Banka Karşılaştırması",
    dateLabel: "Güncelleme: 13 Mart 2026",
  },
});
const HOME_BANK_WALL_BANKS = Object.freeze([
  "İş Bankası",
  "Garanti BBVA",
  "Akbank",
  "Yapı Kredi",
  "DenizBank",
  "QNB",
  "Ziraat Bankası",
  "VakıfBank",
  "Halkbank",
  "TEB",
  "HSBC",
  "Fibabanka",
  "ING",
  "Alternatif Bank",
  "Anadolubank",
  "Odeabank",
  "Şekerbank",
  "Ziraat Katılım",
  "Vakıf Katılım",
  "Albaraka Türk",
  "Kuveyt Türk",
  "Türkiye Finans",
  "ICBC Turkey",
  "Enpara",
  "Aktif Bank",
  "ON Dijital",
  "GetirFinans",
]);
const LOAN_RATES_FILTER_CONFIG = Object.freeze({
  need: {
    defaultAmount: 100000,
    defaultTerm: 12,
    terms: [12, 24, 36],
    loanType: "need",
  },
  housing: {
    defaultAmount: 1000000,
    defaultTerm: 120,
    terms: [60, 120, 180, 240],
    loanType: "housing",
  },
  vehicle: {
    defaultAmount: 100000,
    defaultTerm: 24,
    terms: [12, 24, 36, 48],
    loanType: "vehicle",
  },
  kobi: {
    defaultAmount: 100000,
    defaultTerm: 24,
    terms: [12, 24, 36],
    loanType: "need",
  },
});
const loanRatesFilterState = {
  need: { amount: 100000, term: 12 },
  housing: { amount: 1000000, term: 120 },
  vehicle: { amount: 100000, term: 24 },
  kobi: { amount: 100000, term: 24 },
};
const BANK_PRODUCT_TYPE_CONFIG = Object.freeze({
  need: {
    title: "İhtiyaç Kredisi",
    descriptionLines: ["Tutar: 1.000 - 2.000.000 TL", "Vade: 3 - 36 Ay"],
    amountLabel: "Kredi Tutarı",
    defaultAmount: 50000,
    terms: [{ value: 12, label: "12 Ay" }],
  },
  housing: {
    title: "Konut Kredisi",
    descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 1 - 120 Ay"],
    amountLabel: "Kredi Tutarı",
    defaultAmount: 3000000,
    terms: [{ value: 120, label: "120 Ay" }],
  },
  vehicle: {
    title: "Taşıt Kredisi",
    descriptionLines: ["Tutar: 5.000 - 400.000 TL", "Vade: 1 - 48 Ay"],
    amountLabel: "Kredi Tutarı",
    defaultAmount: 600000,
    terms: [{ value: 24, label: "24 Ay" }],
  },
  kobi: {
    title: "KOBİ Kredisi",
    descriptionLines: ["Tutar: 50.000 - 1.500.000 TL", "Vade: 12 - 36 Ay"],
    amountLabel: "Kredi Tutarı",
    defaultAmount: 200000,
    terms: [{ value: 24, label: "24 Ay" }],
  },
});
const BANK_RATE_LOOKUP_ALIASES = Object.freeze({
  cepteteb: "teb",
  "enpara.com": "qnb",
});
const GENERIC_BANK_FALLBACK_RATES = Object.freeze({
  need: 3.89,
  housing: 2.99,
  vehicle: 3.39,
  kobi: 3.79,
});
const BANK_PROFILE_WEBSITE_MAP = Object.freeze({
  akbank: "https://www.akbank.com/",
  "aktif bank": "https://www.aktifbank.com.tr/",
  anadolubank: "https://www.anadolubank.com.tr/",
  "albaraka türk": "https://www.albaraka.com.tr/",
  "alternatif bank": "https://www.alternatifbank.com.tr/",
  cepteteb: "https://www.teb.com.tr/",
  denizbank: "https://www.denizbank.com/",
  "enpara.com": "https://www.enpara.com/",
  fibabanka: "https://www.fibabanka.com.tr/",
  "garanti bbva": "https://www.garantibbva.com.tr/tr",
  getirfinans: "https://www.getirfinans.com/",
  halkbank: "https://www.halkbank.com.tr/",
  hsbc: "https://www.hsbc.com.tr/",
  "icbc turkey": "https://www.icbc.com.tr/",
  ing: "https://www.ing.com.tr/",
  ıng: "https://www.ing.com.tr/",
  "ıng bank": "https://www.ing.com.tr/",
  "ıng bank a.ş.": "https://www.ing.com.tr/",
  "ıng bank a.s.": "https://www.ing.com.tr/",
  "iş bankası": "https://www.isbank.com.tr/",
  "kuveyt türk": "https://www.kuveytturk.com.tr/",
  "n kolay": "https://www.nkolay.com/",
  odea: "https://www.odeabank.com.tr/",
  odeabank: "https://www.odeabank.com.tr/",
  "on dijital": "https://www.on.com.tr/",
  "on dijital bankacılık": "https://www.on.com.tr/",
  "on dijital bankacilik": "https://www.on.com.tr/",
  qnb: "https://www.qnb.com.tr/",
  sekerbank: "https://www.sekerbank.com.tr/",
  "şekerbank": "https://www.sekerbank.com.tr/",
  teb: "https://www.teb.com.tr/",
  "türkiye finans": "https://www.turkiyefinans.com.tr/",
  "turkiye finans": "https://www.turkiyefinans.com.tr/",
  "vakıf katılım": "https://www.vakifkatilim.com.tr/",
  "vakif katilim": "https://www.vakifkatilim.com.tr/",
  vakıfbank: "https://www.vakifbank.com.tr/",
  vakifbank: "https://www.vakifbank.com.tr/",
  "yapı kredi": "https://www.yapikredi.com.tr/",
  "yapi kredi": "https://www.yapikredi.com.tr/",
  "ziraat bankası": "https://www.ziraatbank.com.tr/",
  "ziraat bankasi": "https://www.ziraatbank.com.tr/",
  "ziraat katılım": "https://www.ziraatkatilim.com.tr/",
  "ziraat katilim": "https://www.ziraatkatilim.com.tr/",
});

const PARTICIPATION_BANK_NAMES = new Set([
  "albaraka türk",
  "albaraka turk",
  "kuveyt türk",
  "kuveyt turk",
  "türkiye finans",
  "turkiye finans",
  "vakıf katılım",
  "vakif katilim",
  "ziraat katılım",
  "ziraat katilim",
]);
const BANK_PROFILE_OVERRIDES = Object.freeze({
  "alternatif bank": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 5.000 - 400.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 1.99, 24: 3.19, 36: 3.09 },
        selectedTerm: 12,
        detailHref: "https://www.alternatifbank.com.tr/bireysel/krediler/ihtiyac-kredisi",
        applyHref: "https://www.alternatifbank.com.tr/bireysel/krediler/ihtiyac-kredisi",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 36 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 3.39, 60: 3.39, 120: 3.39 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 200.000 TL örnek", "Vade: 12 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 200000,
        rateMap: { 12: 3.52, 24: 3.52, 36: 3.52, 48: 3.52 },
        selectedTerm: 24,
      },
    ],
  },
  anadolubank: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 250.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 4.49, 24: 4.49, 36: 4.49 },
        selectedTerm: 24,
        detailHref: "https://www.anadolubank.com.tr/sizin-icin/krediler/ihtiyac-kredisi",
        applyHref: "https://www.anadolubank.com.tr/ihtiyac-kredisi-basvuru/",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 36 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 4.29, 60: 4.29, 120: 4.29 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 200.000 TL örnek", "Vade: 12 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 200000,
        rateMap: { 12: 5.3, 24: 5.3, 36: 5.3, 48: 5.3 },
        selectedTerm: 24,
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "Renkli Hesap",
        descriptionLines: ["Online başvuru ile %43'e varan hoş geldin faizi sunar."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 43.0, 92: 43.0, 181: 43.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.anadolubank.com.tr/sizin-icin/birikim-ve-mevduat/renkli-hesap",
        applyHref: "https://www.anadolubank.com.tr/sizin-icin/birikim-ve-mevduat/renkli-hesap",
      },
    ],
  },
  "icbc turkey": {
    primaryProducts: [
      {
        kind: "loan",
        title: "Hesaplı Kredi",
        descriptionLines: ["Tutar: 1.000 - 500.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 3.42, 24: 3.42, 36: 3.42 },
        selectedTerm: 24,
        detailHref: "https://www.icbc.com.tr/tr/sizin-icin/detay/Ihtiyac-Kredisi/40/11/0",
        applyHref: "https://www.icbc.com.tr/tr/sizin-icin/detay/Ihtiyac-Kredisi/40/11/0",
      },
      {
        kind: "loan",
        title: "Yeni Evim Kredisi",
        descriptionLines: ["Tutar: Ekspertiz değerinin %90'ına kadar", "Vade: 12 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 3.42, 60: 3.42, 120: 3.42 },
        selectedTerm: 120,
        detailHref: "https://www.icbc.com.tr/tr/sizin-icin/detay/Konut-Kredisi/417/12/0",
        applyHref: "https://www.icbc.com.tr/tr/sizin-icin/detay/Konut-Kredisi/417/12/0",
      },
      {
        kind: "loan",
        title: "Yeni Arabam Kredisi",
        descriptionLines: ["Tutar: Araç değerine göre değişir", "Vade: 12 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 200000,
        rateMap: { 12: 3.59, 24: 3.59, 36: 3.59, 48: 3.59 },
        selectedTerm: 24,
        detailHref: "https://www.icbc.com.tr/tr/sizin-icin/detay/Tasit-Kredisi/42/13/0",
        applyHref: "https://www.icbc.com.tr/tr/sizin-icin/detay/Tasit-Kredisi/42/13/0",
      },
    ],
  },
  "n kolay": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 2.000 - 750.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 3.39, 24: 3.39, 36: 3.39 },
        selectedTerm: 24,
      },
    ],
  },
  hsbc: {
    disableGenericPrimaryProducts: true,
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 12 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.76, 24: 3.61, 36: 3.54 },
        selectedTerm: 12,
        insuranceOptions: [
          {
            label: "Hayat sigortası var",
            rateMap: { 12: 3.76, 24: 3.61, 36: 3.54 },
            selected: true,
          },
        ],
        detailHref: "https://www.hsbc.com.tr/krediler/ihtiyac-kredisi",
        applyHref: "https://www.hsbc.com.tr/krediler/ihtiyac-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "Modern Hesap",
        descriptionLines: ["HSBC mobil ve internet şubede sunulan vadeli mevduat ürünü."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 39.0, 92: 39.0, 181: 32.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.hsbc.com.tr/mevduat/modern-hesap",
        applyHref: "https://www.hsbc.com.tr/mevduat/modern-hesap",
      },
    ],
  },
  fibabanka: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 12 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 4.36, 24: 3.97, 36: 3.79 },
        selectedTerm: 12,
        insuranceOptions: [
          {
            label: "Hayat sigortası var",
            rateMap: { 12: 4.36, 24: 3.97, 36: 3.79 },
            selected: true,
          },
        ],
        detailHref: "https://www.fibabanka.com.tr/krediler/ihtiyac-kredisi",
        applyHref: "https://www.fibabanka.com.tr/krediler/ihtiyac-kredisi",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 36 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 4.22, 60: 4.22, 120: 4.57 },
        selectedTerm: 120,
        detailHref: "https://www.fibabanka.com.tr/krediler/konut-kredisi",
        applyHref: "https://www.fibabanka.com.tr/krediler/konut-kredisi",
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 12 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 4.21, 24: 4.27, 36: 4.38, 48: 4.58 },
        selectedTerm: 24,
        detailHref: "https://www.fibabanka.com.tr/krediler/tasit-kredisi",
        applyHref: "https://www.fibabanka.com.tr/krediler/tasit-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "e-Mevduat",
        descriptionLines: ["Fibabanka dijital kanalda açılan vadeli mevduat ürünü."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 37.0, 92: 36.5, 181: 30.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.fibabanka.com.tr/mevduat/e-mevduat",
        applyHref: "https://www.fibabanka.com.tr/mevduat/e-mevduat",
      },
    ],
  },
  sekerbank: {
    primaryProducts: [
      {
        kind: "loan",
        title: "Dijital İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 36 Ay örnek"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 36: 3.5 },
        selectedTerm: 36,
        detailHref: "https://www.sekerbank.com.tr/bireysel/bireysel-krediler/ihtiyac-kredisi/dijital-ihtiyac-kredisi-kampanyasi",
        applyHref: "https://www.sekerbank.com.tr/bireysel/bireysel-krediler/ihtiyac-kredisi/dijital-ihtiyac-kredisi-kampanyasi",
      },
    ],
    secondaryProducts: [
      {
        kind: "kmh",
        title: "Taksitli Tamamlayan Hesap",
        descriptionLines: ["Tutar: 10.000 TL örnek", "Vade: 3 - 12 Ay"],
        amountLabel: "Tutar",
        defaultAmount: 10000,
        rateMap: { 3: 3.95, 6: 3.95, 12: 3.95 },
        selectedTerm: 12,
        secondaryLabel: "Tahmini Faiz",
        tertiaryLabel: "Toplam Geri Ödeme",
        detailHref: "https://www.sekerbank.com.tr/bireysel/bireysel-krediler/tamamlayan-hesaplar/taksitli-tamamlayan-hesap",
        applyHref: "https://www.sekerbank.com.tr/bireysel/bireysel-krediler/tamamlayan-hesaplar/taksitli-tamamlayan-hesap",
      },
    ],
  },
  halkbank: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 150.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 5.25, 24: 5.25, 36: 5.25 },
        selectedTerm: 24,
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 24 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 24: 3.25, 60: 3.25, 120: 3.25 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 24 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 24: 4.89, 36: 4.89, 48: 4.89 },
        selectedTerm: 24,
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "E-Mevduat",
        descriptionLines: ["Halkbank mobil ve internet şubede açılan vadeli hesap."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 39.0, 92: 37.0, 181: 35.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.halkbank.com.tr/tr/bireysel/mevduat/vadeli-hesaplar/e-mevduat.html",
        applyHref: "https://www.halkbank.com.tr/tr/bireysel/mevduat/vadeli-hesaplar/e-mevduat.html",
      },
    ],
  },
  vakıfbank: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 12 - 24 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.99, 24: 3.99 },
        selectedTerm: 12,
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 24 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 24: 2.54, 60: 2.54, 120: 2.54 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 24 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 24: 3.84, 36: 3.84, 48: 3.84 },
        selectedTerm: 24,
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "ARI Hesabı",
        descriptionLines: ["VakıfBank mobil ve internet bankacılığında günlük faizli hesap."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 41.0, 92: 23.0, 181: 23.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.vakifbank.com.tr/tr/bireysel/hesaplar/vadeli-hesaplar/ari-hesabi",
        applyHref: "https://www.vakifbank.com.tr/tr/bireysel/hesaplar/vadeli-hesaplar/ari-hesabi",
      },
    ],
  },
  "ziraat bankası": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 12 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 4.99, 24: 4.99, 36: 4.99 },
        selectedTerm: 12,
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 24 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 24: 3.19, 60: 3.19, 120: 3.19 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 24 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 24: 4.79, 36: 4.79, 48: 4.79 },
        selectedTerm: 24,
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "Vadeli TL Mevduat Hesabı",
        descriptionLines: ["Ziraat Mobil ve internet şubede açılan vadeli TL mevduat ürünü."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 34.0, 92: 33.0, 181: 27.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref:
          "https://www.ziraatbank.com.tr/tr/bireysel/mevduat/vadeli-hesaplar/vadeli-tl-mevduat-hesaplari/vadeli-tl-mevduat-hesabi",
        applyHref:
          "https://www.ziraatbank.com.tr/tr/bireysel/mevduat/vadeli-hesaplar/vadeli-tl-mevduat-hesaplari/vadeli-tl-mevduat-hesabi",
      },
    ],
  },
  teb: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 400.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 125000,
        rateMap: { 12: 3.8, 24: 3.8, 36: 3.8 },
        selectedTerm: 36,
        insuranceOptions: [
          {
            label: "Hayat Sigortalı",
            rateMap: { 12: 3.8, 24: 3.8, 36: 3.8 },
            selected: true,
          },
          {
            label: "Hayat Sigortasız",
            rateMap: { 12: 5.8, 24: 5.8, 36: 5.8 },
          },
        ],
        detailHref: "https://www.teb.com.tr/sizin-icin/ihtiyac-kredisi/",
        applyHref: "https://www.teb.com.tr/sizin-icin/ihtiyac-kredisi/",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 36 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 3.02, 60: 2.93, 120: 2.69 },
        selectedTerm: 120,
        detailHref: "https://www.teb.com.tr/sizin-icin/konut-kredisi/",
        applyHref: "https://www.teb.com.tr/sizin-icin/konut-kredisi/",
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 100.000 TL örnek", "Vade: 12 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.29, 24: 3.24, 36: 3.19 },
        selectedTerm: 24,
        insuranceOptions: [
          {
            label: "Hayat sigortası var",
            rateMap: { 12: 3.29, 24: 3.24, 36: 3.19 },
            selected: true,
          },
          {
            label: "Hayat sigortası yok",
            rateMap: { 12: 3.39, 24: 3.34, 36: 3.29 },
          },
        ],
        detailHref: "https://www.teb.com.tr/sizin-icin/tasit-kredisi/",
        applyHref: "https://www.teb.com.tr/sizin-icin/tasit-kredisi/",
      },
    ],
    secondaryProducts: [
      {
        kind: "kmh",
        title: "Kredili Mevduat Hesabı",
        descriptionLines: ["Resmi TEB sayfasındaki güncel KMH oranıyla örnek hesaplama sunar."],
        amountLabel: "Tutar",
        defaultAmount: 25000,
        rateMap: { 1: 4.25 },
        selectedTerm: 1,
        secondaryLabel: "Tahmini Faiz",
        tertiaryLabel: "Toplam Geri Ödeme",
        detailHref: "https://www.teb.com.tr/sizin-icin/kredili-mevduat-hesabi/",
        applyHref: "https://www.teb.com.tr/sizin-icin/kredili-mevduat-hesabi/",
      },
    ],
  },
  cepteteb: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 400.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 50000,
        rateMap: { 3: 2.99, 12: 2.99, 24: 2.99, 36: 2.99 },
        selectedTerm: 12,
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 200.000 TL örnek", "Vade: 12 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 200000,
        rateMap: { 24: 3.31, 36: 3.31, 48: 3.31 },
        selectedTerm: 24,
      },
    ],
  },
  "albaraka türk": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Finansmanı",
        descriptionLines: ["Tutar: 500 - 100.000 TL", "Vade: 3 - 24 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 4.0, 24: 4.0, 36: 4.0 },
        selectedTerm: 24,
      },
      {
        kind: "loan",
        title: "Konut Finansmanı",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 36 - 120 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 2.75, 60: 2.75, 120: 2.75 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Finansmanı",
        descriptionLines: ["Tutar: 200.000 TL örnek", "Vade: 12 - 48 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 200000,
        rateMap: { 12: 2.96, 24: 2.96, 36: 2.96, 48: 2.96 },
        selectedTerm: 24,
      },
    ],
  },
  "vakıf katılım": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Finansmanı",
        descriptionLines: ["Tutar: 1.000 - 1.000.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 3.68, 24: 3.68, 36: 3.68 },
        selectedTerm: 24,
      },
      {
        kind: "loan",
        title: "Konut Finansmanı",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 36 - 120 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 2.54, 60: 2.54, 120: 2.74 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Finansmanı",
        descriptionLines: ["Tutar: 200.000 TL örnek", "Vade: 12 - 48 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 200000,
        rateMap: { 12: 2.94, 24: 2.94, 36: 2.94, 48: 2.94 },
        selectedTerm: 24,
      },
    ],
  },
  "ziraat katılım": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Finansmanı",
        descriptionLines: ["Tutar: 1 - 125.000 TL örnek", "Vade: 1 - 36 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 3.79, 24: 3.79, 36: 3.79 },
        selectedTerm: 36,
        detailHref: "https://www.ziraatkatilim.com.tr/bireysel/finansman-urunleri/ihtiyac-finansmani",
        applyHref: "https://www.ziraatkatilim.com.tr/bireysel/finansman-urunleri/ihtiyac-finansmani",
      },
    ],
  },
  "kuveyt türk": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Finansmanı",
        descriptionLines: ["Tutar: 1.000 - 70.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 3.77, 24: 3.22, 36: 3.22 },
        selectedTerm: 24,
      },
      {
        kind: "loan",
        title: "Konut Finansmanı",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 36 - 120 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 2.6, 60: 2.6, 120: 2.55 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Finansmanı",
        descriptionLines: ["Tutar: 200.000 TL örnek", "Vade: 12 - 48 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 200000,
        rateMap: { 12: 2.98, 24: 2.98, 36: 2.92, 48: 2.92 },
        selectedTerm: 24,
      },
    ],
  },
  "türkiye finans": {
    primaryProducts: [
      {
        kind: "loan",
        title: "Dijital İhtiyaç Finansmanı",
        descriptionLines: ["Tutar: 1.000 - 400.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 3.69, 24: 3.62, 36: 3.58 },
        selectedTerm: 24,
        insuranceOptions: [
          {
            label: "Hayat Sigortalı",
            rateMap: { 12: 3.69, 24: 3.62, 36: 3.58 },
            selected: true,
          },
          {
            label: "Hayat Sigortasız",
            rateMap: { 12: 5.69, 24: 5.64, 36: 5.49 },
          },
        ],
        detailHref: "https://www.turkiyefinans.com.tr/tr-tr/bireysel/ihtiyac-finansmani/sayfalar/dijital-ihtiyac-finansmani.aspx",
        applyHref: "https://www.turkiyefinans.com.tr/tr-tr/bireysel/ihtiyac-finansmani/sayfalar/dijital-ihtiyac-finansmani.aspx",
      },
      {
        kind: "loan",
        title: "Konut Finansmanı",
        descriptionLines: ["Tutar: 1.000.000 TL örnek", "Vade: 36 - 120 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 2.7, 60: 2.7, 120: 2.7 },
        selectedTerm: 120,
      },
      {
        kind: "loan",
        title: "Taşıt Finansmanı",
        descriptionLines: ["Tutar: 200.000 TL örnek", "Vade: 12 - 48 Ay"],
        amountLabel: "Finansman Tutarı",
        defaultAmount: 200000,
        rateMap: { 12: 3.15, 24: 3.15, 36: 3.15, 48: 3.15 },
        selectedTerm: 24,
      },
    ],
  },
  "garanti bbva": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 5.000 - 500.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 4.74, 24: 3.94, 36: 3.64 },
        selectedTerm: 12,
        detailHref: "https://www.garantibbva.com.tr/krediler/ihtiyac-kredisi",
        applyHref: "https://www.garantibbva.com.tr/krediler/ihtiyac-kredisi",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 60 - 240 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 60: 2.89, 120: 2.89, 180: 3.31, 240: 3.31 },
        selectedTerm: 120,
        feeItems: [
          { label: "Kıymet Takdir (Ekspertiz) Ücreti" },
          { label: "Tahsis Ücreti" },
          { label: "Rehin Tesis Ücreti" },
        ],
        detailHref: "https://www.garantibbva.com.tr/tr/kendim-icin/krediler/konut-kredisi",
        applyHref: "https://www.garantibbva.com.tr/tr/kendim-icin/krediler/konut-kredisi",
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 5.000 - 400.000 TL", "Vade: 12 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.49, 24: 3.39, 36: 3.29, 48: 3.19 },
        selectedTerm: 12,
        insuranceOptions: [
          {
            label: "Hayat Sigortası Yok",
            rateMap: { 12: 3.49, 24: 3.39, 36: 3.29, 48: 3.19 },
            selected: true,
          },
        ],
        feeItems: [
          { label: "Kasko" },
          { label: "Tahsis Ücreti" },
          { label: "Rehin Tesis Ücreti" },
        ],
        detailHref: "https://www.garantibbva.com.tr/krediler/444-otom",
        applyHref: "https://www.garantibbva.com.tr/krediler/444-otom",
      },
    ],
  },
  qnb: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 500.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 1.99, 24: 2.54, 36: 3.04 },
        selectedTerm: 12,
        detailHref: "https://www.qnb.com.tr/krediler/ihtiyac-kredisi",
        applyHref: "https://www.qnb.com.tr/krediler/ihtiyac-kredisi",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 12 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 24: 2.49, 60: 2.49, 120: 2.49, 180: 3.62 },
        selectedTerm: 120,
        detailHref: "https://www.qnb.com.tr/krediler/konut-kredisi",
        applyHref: "https://www.qnb.com.tr/krediler/konut-kredisi",
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 50.000 - 400.000 TL", "Vade: 12 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 250000,
        rateMap: { 12: 4.72, 24: 4.72, 36: 4.72, 48: 4.72 },
        selectedTerm: 24,
        insuranceOptions: [
          {
            label: "Hayat sigortası yok",
            rateMap: { 12: 4.72, 24: 4.72, 36: 4.72, 48: 4.72 },
            selected: true,
          },
        ],
        feeItems: [{ label: "Tahsis Ücreti" }, { label: "Rehin Tesis Ücreti" }],
        detailHref: "https://www.qnb.com.tr/krediler/tasit-kredisi",
        applyHref: "https://www.qnb.com.tr/krediler/tasit-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "E-Vadeli Hesap",
        descriptionLines: ["QNB Mobil ve internet şubeden açılan vadeli mevduat hesabı."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 40.75, 92: 40.75, 181: 40.75 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.qnb.com.tr/mevduat/e-vadeli-hesap",
        applyHref: "https://www.qnb.com.tr/mevduat/e-vadeli-hesap",
      },
    ],
  },
  denizbank: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 10.000 - 125.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 4.11, 24: 3.77, 36: 2.89 },
        selectedTerm: 36,
        detailHref: "https://www.denizbank.com/kendim-icin/krediler/ihtiyac-kredileri/ihtiyac-kredisi",
        applyHref: "https://www.denizbank.com/kendim-icin/krediler/ihtiyac-kredileri/ihtiyac-kredisi",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 24 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 24: 3.51, 60: 3.21, 120: 3.21 },
        selectedTerm: 120,
        detailHref: "https://www.denizbank.com/kendim-icin/krediler/konut-kredisi",
        applyHref: "https://www.denizbank.com/kendim-icin/krediler/konut-kredisi",
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 50.000 - 400.000 TL", "Vade: 12 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 250000,
        rateMap: { 12: 4.51, 24: 4.51, 36: 4.51, 48: 4.51 },
        selectedTerm: 48,
        feeItems: [{ label: "Tahsis Ücreti" }],
        detailHref: "https://www.denizbank.com/kendim-icin/krediler/tasit-kredisi",
        applyHref: "https://www.denizbank.com/kendim-icin/krediler/tasit-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "Para Çekilebilir Mevduat",
        descriptionLines: ["Vade içinde para çekme esnekliği sunan mevduat ürünü."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 32.25, 92: 32.25, 181: 32.25 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.denizbank.com/kendim-icin/mevduat/para-cekilebilir-mevduat",
        applyHref: "https://www.denizbank.com/kendim-icin/mevduat/para-cekilebilir-mevduat",
      },
    ],
  },
  ing: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 10.000 - 100.000 TL", "Vade: 6 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 6: 0.99, 12: 4.44, 24: 4.24, 36: 3.19 },
        selectedTerm: 36,
        detailHref: "https://www.ing.com.tr/tr/bireysel/krediler/ihtiyac-kredisi",
        applyHref: "https://www.ing.com.tr/tr/bireysel/krediler/ihtiyac-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "Turuncu Hesap",
        descriptionLines: ["Hoş geldin faizli birikim hesabı."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 46.0, 92: 46.0, 181: 23.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.ing.com.tr/tr/bireysel/mevduat/turuncu-hesap",
        applyHref: "https://www.ing.com.tr/tr/bireysel/mevduat/turuncu-hesap",
      },
    ],
  },
  odeabank: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 10.000 TL örnek", "Vade: 24 Ay örnek"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 10000,
        rateMap: { 24: 5.99 },
        selectedTerm: 24,
        detailHref: "https://www.odeabank.com.tr/tr-tr/bireysel/krediler/ihtiyac-kredisi",
        applyHref: "https://www.odeabank.com.tr/tr-tr/bireysel/krediler/ihtiyac-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "Oksijen Hesap",
        descriptionLines: ["Dijital kanalda açılan yüksek faizli mevduat hesabı."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 39.0, 92: 40.0, 181: 23.5 },
        selectedTerm: 92,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.odeabank.com.tr/tr-tr/bireysel/mevduat/oksijen-hesap",
        applyHref: "https://www.odeabank.com.tr/tr-tr/bireysel/mevduat/oksijen-hesap",
      },
    ],
  },
  akbank: {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 2.500 - 750.000 TL", "Vade: 1 - 24 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 250500,
        rateMap: { 12: 3.89, 24: 3.59, 36: 3.44 },
        selectedTerm: 24,
        insuranceOptions: [
          {
            label: "Hayat Sigortalı",
            rateMap: { 12: 3.89, 24: 3.59, 36: 3.44 },
            selected: true,
          },
          {
            label: "Hayat Sigortasız",
            rateMap: { 12: 5.09, 24: 5.09, 36: 5.09 },
          },
        ],
        detailHref: "https://www.akbank.com/krediler/ihtiyac-kredileri",
        applyHref: "https://www.akbank.com/krediler/ihtiyac-kredileri",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: 10.000 - 999.999.999 TL", "Vade: 1 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 500000,
        rateMap: { 24: 3.28, 60: 2.9, 120: 2.79 },
        selectedTerm: 60,
        insuranceOptions: [
          {
            label: "Hayat Sigortalı",
            rateMap: { 24: 3.28, 60: 2.9, 120: 2.79 },
            selected: true,
          },
          {
            label: "Hayat Sigortasız",
            rateMap: { 24: 3.38, 60: 3.38, 120: 3.38 },
          },
        ],
        feeItems: [
          { label: "Kıymet Takdir (Ekspertiz) Ücreti" },
          { label: "Tahsis Ücreti" },
          { label: "Rehin Tesis Ücreti" },
        ],
        detailHref: "https://www.akbank.com/krediler/konut-kredileri/akbank-konut-kredisi",
        applyHref: "https://www.akbank.com/krediler/konut-kredileri/akbank-konut-kredisi",
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 5.000 - 1,000,000 TL", "Vade: 1 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 250000,
        rateMap: { 12: 3.48, 24: 3.3, 36: 3.19, 48: 3.09 },
        selectedTerm: 24,
        insuranceOptions: [
          {
            label: "Hayat sigortası var",
            rateMap: { 12: 3.48, 24: 3.3, 36: 3.19, 48: 3.09 },
            selected: true,
          },
          {
            label: "Hayat sigortası yok",
            rateMap: { 12: 3.58, 24: 3.4, 36: 3.29, 48: 3.19 },
          },
        ],
        detailHref: "https://www.akbank.com/krediler/tasit-kredileri/ikinci-el-tasit-kredisi",
        applyHref: "https://www.akbank.com/krediler/tasit-kredileri/ikinci-el-tasit-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "Vadeli Mevduat Hesabı",
        descriptionLines: ["Akbank resmi vadeli mevduat sayfasında duyurulan oran."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 40.5, 92: 40.5, 181: 40.5 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.akbank.com/tr-tr/urunler/Sayfalar/Vadeli-Mevduat-Hesabi.aspx",
        applyHref: "https://www.akbank.com/tr-tr/urunler/Sayfalar/Vadeli-Mevduat-Hesabi.aspx",
      },
    ],
  },
  "yapı kredi": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 250.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 5.09, 24: 4.69, 36: 4.29 },
        selectedTerm: 12,
        detailHref: "https://www.yapikredi.com.tr/kredi/ihtiyac-kredisi",
        applyHref: "https://www.yapikredi.com.tr/kredi/ihtiyac-kredisi",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 36 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 3.22, 60: 2.49, 84: 2.49, 96: 2.49, 120: 2.49 },
        selectedTerm: 120,
        detailHref: "https://www.yapikredi.com.tr/kredi/konut-kredisi",
        applyHref: "https://www.yapikredi.com.tr/kredi/konut-kredisi",
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 5.000 - 2,000.000 TL", "Vade: 1 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.39, 24: 3.29, 36: 3.29, 48: 3.29 },
        selectedTerm: 24,
        feeItems: [{ label: "Kasko" }, { label: "Tahsis Ücreti" }],
        detailHref: "https://www.yapikredi.com.tr/kredi/tasit-kredisi",
        applyHref: "https://www.yapikredi.com.tr/kredi/tasit-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "E-Vadeli Hesap",
        descriptionLines: ["Yapı Kredi e-mevduat sayfasında duyurulan oran."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 43.0, 92: 43.0, 181: 43.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.yapikredi.com.tr/mevduat/e-vadeli-hesap",
        applyHref: "https://www.yapikredi.com.tr/mevduat/e-vadeli-hesap",
      },
    ],
  },
  "yapi kredi": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 250.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 5.09, 24: 4.69, 36: 4.29 },
        selectedTerm: 12,
        detailHref: "https://www.yapikredi.com.tr/kredi/ihtiyac-kredisi",
        applyHref: "https://www.yapikredi.com.tr/kredi/ihtiyac-kredisi",
      },
      {
        kind: "loan",
        title: "Konut Kredisi",
        descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 36 - 120 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 1000000,
        rateMap: { 36: 3.22, 60: 2.49, 84: 2.49, 96: 2.49, 120: 2.49 },
        selectedTerm: 120,
        detailHref: "https://www.yapikredi.com.tr/kredi/konut-kredisi",
        applyHref: "https://www.yapikredi.com.tr/kredi/konut-kredisi",
      },
      {
        kind: "loan",
        title: "Taşıt Kredisi",
        descriptionLines: ["Tutar: 5.000 - 2,000.000 TL", "Vade: 1 - 48 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.39, 24: 3.29, 36: 3.29, 48: 3.29 },
        selectedTerm: 24,
        feeItems: [{ label: "Kasko" }, { label: "Tahsis Ücreti" }],
        detailHref: "https://www.yapikredi.com.tr/kredi/tasit-kredisi",
        applyHref: "https://www.yapikredi.com.tr/kredi/tasit-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "E-Vadeli Hesap",
        descriptionLines: ["Yapı Kredi e-mevduat sayfasında duyurulan oran."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 43.0, 92: 43.0, 181: 43.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.yapikredi.com.tr/mevduat/e-vadeli-hesap",
        applyHref: "https://www.yapikredi.com.tr/mevduat/e-vadeli-hesap",
      },
    ],
  },
  "on dijital": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 300.000 TL", "Vade: 12 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.39, 18: 3.25, 24: 2.99, 36: 2.99 },
        selectedTerm: 24,
        detailHref: "https://www.on.com.tr/ihtiyac-kredisi",
        applyHref: "https://www.on.com.tr/ihtiyac-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "ON Plus Hesap",
        descriptionLines: ["Mobil kanal üzerinden yüksek faizli birikim hesabı."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 47.5, 92: 47.5, 181: 42.5 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.on.com.tr/mevduat",
        applyHref: "https://www.on.com.tr/mevduat",
      },
    ],
  },
  "on dijital bankacılık": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 300.000 TL", "Vade: 12 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.39, 18: 3.25, 24: 2.99, 36: 2.99 },
        selectedTerm: 24,
        detailHref: "https://www.on.com.tr/ihtiyac-kredisi",
        applyHref: "https://www.on.com.tr/ihtiyac-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "ON Plus Hesap",
        descriptionLines: ["Mobil kanal üzerinden yüksek faizli birikim hesabı."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 47.5, 92: 47.5, 181: 42.5 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.on.com.tr/mevduat",
        applyHref: "https://www.on.com.tr/mevduat",
      },
    ],
  },
  "on dijital bankacilik": {
    primaryProducts: [
      {
        kind: "loan",
        title: "İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 300.000 TL", "Vade: 12 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.39, 18: 3.25, 24: 2.99, 36: 2.99 },
        selectedTerm: 24,
        detailHref: "https://www.on.com.tr/ihtiyac-kredisi",
        applyHref: "https://www.on.com.tr/ihtiyac-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "ON Plus Hesap",
        descriptionLines: ["Mobil kanal üzerinden yüksek faizli birikim hesabı."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 47.5, 92: 47.5, 181: 42.5 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.on.com.tr/mevduat",
        applyHref: "https://www.on.com.tr/mevduat",
      },
    ],
  },
  "aktif bank": {
    primaryProducts: [
      {
        kind: "loan",
        title: "N Kolay İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 250.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 100000,
        rateMap: { 12: 3.89, 24: 3.89, 36: 3.89 },
        selectedTerm: 12,
        detailHref: "https://www.nkolay.com/ihtiyac-kredisi",
        applyHref: "https://www.nkolay.com/ihtiyac-kredisi",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "N Kolay Bono",
        descriptionLines: ["Günlük getiri sunan dijital birikim ürünü."],
        amountLabel: "Tutar",
        defaultAmount: 250000,
        rateMap: { 32: 37.0, 92: 37.0, 181: 37.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.nkolay.com/bono",
        applyHref: "https://www.nkolay.com/bono",
      },
    ],
  },
  enpara: {
    secondaryProducts: [
      {
        kind: "deposit",
        title: "Birikim Hesabı",
        descriptionLines: ["Enpara.com birikim hesabı için duyurulan yıllık faiz oranı."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 39.5, 92: 39.5, 181: 39.5 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.enpara.com/birikim-hesabi",
        applyHref: "https://www.enpara.com/birikim-hesabi",
      },
    ],
  },
  getirfinans: {
    primaryProducts: [
      {
        kind: "loan",
        title: "GetirFinans İhtiyaç Kredisi",
        descriptionLines: ["Tutar: 1.000 - 100.000 TL", "Vade: 3 - 36 Ay"],
        amountLabel: "Kredi Tutarı",
        defaultAmount: 50000,
        rateMap: { 12: 2.79, 24: 3.49, 36: 4.2 },
        selectedTerm: 12,
        detailHref: "https://www.getirfinans.com/",
        applyHref: "https://www.getirfinans.com/",
      },
    ],
    secondaryProducts: [
      {
        kind: "deposit",
        title: "GetirFinans Birikim",
        descriptionLines: ["GetirFinans uygulamasında sunulan yüksek faizli birikim ürünü."],
        amountLabel: "Mevduat Tutarı",
        defaultAmount: 250000,
        rateMap: { 32: 41.0, 92: 41.0, 181: 41.0 },
        selectedTerm: 32,
        secondaryLabel: "Net Getiri",
        tertiaryLabel: "Vade Sonu Tutar",
        detailHref: "https://www.getirfinans.com/",
        applyHref: "https://www.getirfinans.com/",
      },
    ],
  },
});
const BANK_MOBILE_APP_QUERY_MAP = Object.freeze({
  akbank: "Akbank Mobil",
  "garanti bbva": "Garanti BBVA Mobil",
  "iş bankası": "İşCep",
  qnb: "QNB Mobil",
  "yapı kredi": "Yapı Kredi Mobil",
  denizbank: "DenizMobil",
  teb: "CEPTETEB",
  fibabanka: "Fibabanka Mobil",
  halkbank: "Halkbank Mobil",
  "vakıfbank": "VakıfBank Mobil Bankacılık",
  "ziraat bankası": "Ziraat Mobil",
  "vakıf katılım": "Vakıf Katılım Mobil",
  "ziraat katılım": "Ziraat Katılım Mobil",
  hsbc: "HSBC Mobil Bankacılık",
  odeabank: "Odeabank Mobil",
  "alternatif bank": "Alternatif Bank Mobil",
  anadolubank: "Anadolubank Mobil",
  "şekerbank": "Şeker Mobil",
  "albaraka türk": "Albaraka Mobil",
  "kuveyt türk": "Kuveyt Türk Mobil",
  "türkiye finans": "Türkiye Finans Mobil",
  ing: "ING Mobil",
  "icbc turkey": "ICBC Turkey Mobil",
  on: "ON Dijital Bankacılık",
  "n kolay": "N Kolay",
  getirfinans: "GetirFinans",
  "enpara.com": "Enpara.com Cep Şubesi",
});
const BANK_MOBILE_APP_STORE_LINKS = Object.freeze({
  akbank: {
    android: "https://play.google.com/store/apps/details?id=com.akbank.android.apps.akbank_direkt&hl=tr",
    ios: "https://apps.apple.com/tr/app/id560516360",
  },
  "garanti bbva": {
    android: "https://play.google.com/store/apps/details?id=com.garanti.cepsubesi&hl=tr",
    ios: "https://apps.apple.com/tr/app/id521117624",
  },
  "iş bankası": {
    android: "https://play.google.com/store/apps/details?id=com.pozitron.iscep&hl=tr",
    ios: "https://apps.apple.com/tr/app/id308261752",
  },
  "is bankasi": {
    android: "https://play.google.com/store/apps/details?id=com.pozitron.iscep&hl=tr",
    ios: "https://apps.apple.com/tr/app/id308261752",
  },
  qnb: {
    android: "https://play.google.com/store/apps/details?id=com.finansbank.mobile.cepsube&hl=tr",
    ios: "https://apps.apple.com/tr/app/id739655617",
  },
  "enpara.com": {
    android: "https://play.google.com/store/apps/details?id=finansbank.enpara&hl=tr",
    ios: "https://apps.apple.com/tr/app/enpara-com-cep-%C5%9Fubesi/id660620273",
  },
  "yapı kredi": {
    android: "https://play.google.com/store/apps/details?id=com.ykb.android&hl=tr",
    ios: "https://apps.apple.com/tr/app/id458627086",
  },
  "yapi kredi": {
    android: "https://play.google.com/store/apps/details?id=com.ykb.android&hl=tr",
    ios: "https://apps.apple.com/tr/app/id458627086",
  },
  cepteteb: {
    android: "https://play.google.com/store/apps/details?id=com.teb&hl=tr",
    ios: "https://apps.apple.com/tr/app/id353385550",
  },
  teb: {
    android: "https://play.google.com/store/apps/details?id=com.teb&hl=tr",
    ios: "https://apps.apple.com/tr/app/id353385550",
  },
  ing: {
    android: "https://play.google.com/store/apps/details?id=com.ingbanktr.ingmobil&hl=tr",
    ios: "https://apps.apple.com/tr/app/id395535459",
  },
  "ziraat bankası": {
    android: "https://play.google.com/store/apps/details?id=com.ziraat.ziraatmobil&hl=tr",
    ios: "https://apps.apple.com/tr/app/id885993234",
  },
  halkbank: {
    android: "https://play.google.com/store/apps/details?id=com.tmobtech.halkbank&hl=tr",
    ios: "https://apps.apple.com/tr/app/halkbank-mobil/id1068841746",
  },
  "alternatif bank": {
    android: "https://play.google.com/store/apps/details?id=tr.com.alternatifbank.vov&hl=tr",
    ios: "https://apps.apple.com/tr/app/vov/id6453521320",
  },
  anadolubank: {
    android: "https://play.google.com/store/apps/details?id=com.anadolubank.android&hl=tr",
    ios: "https://apps.apple.com/tr/app/anadolubank-mobil/id1441752495",
  },
  "icbc turkey": {
    android: "https://play.google.com/store/apps/details?id=tr.com.icbc&hl=tr",
    ios: "https://apps.apple.com/tr/app/icbc-turkey/id1438010678",
  },
  vakıfbank: {
    android: "https://play.google.com/store/apps/details?id=com.vakifbank.mobile&hl=tr",
    ios: "https://apps.apple.com/tr/app/id853569450",
  },
  vakifbank: {
    android: "https://play.google.com/store/apps/details?id=com.vakifbank.mobile&hl=tr",
    ios: "https://apps.apple.com/tr/app/id853569450",
  },
  denizbank: {
    android: "https://play.google.com/store/apps/details?id=com.denizbank.mobildeniz&hl=tr",
    ios: "https://apps.apple.com/tr/app/id1403334281",
  },
  fibabanka: {
    android: "https://play.google.com/store/apps/details?id=com.fibabanka.mobile&hl=tr",
    ios: "https://apps.apple.com/tr/app/id1489574086",
  },
  odeabank: {
    android: "https://play.google.com/store/apps/details?id=com.magiclick.odeabank&hl=tr",
    ios: "https://apps.apple.com/tr/app/odea-mobil-bankac%C4%B1l%C4%B1k/id634414038",
  },
  odea: {
    android: "https://play.google.com/store/apps/details?id=com.magiclick.odeabank&hl=tr",
    ios: "https://apps.apple.com/tr/app/odea-mobil-bankac%C4%B1l%C4%B1k/id634414038",
  },
  hsbc: {
    android: "https://play.google.com/store/apps/details?id=tr.com.hsbc.hsbcturkey&hl=tr",
    ios: "https://apps.apple.com/tr/app/hsbc-turkey/id1339127709",
  },
  "n kolay": {
    android: "https://play.google.com/store/apps/details?id=com.aktifbank.nkolay&hl=tr",
    ios: "https://apps.apple.com/tr/app/n-kolay-dijital-bankac%C4%B1l%C4%B1k/id1449491530",
  },
  "on dijital": {
    android: "https://play.google.com/store/apps/details?id=com.onbank.mobil&hl=tr",
    ios: "https://apps.apple.com/tr/app/on-mobil/id1584313693",
  },
  "on dijital bankacılık": {
    android: "https://play.google.com/store/apps/details?id=com.onbank.mobil&hl=tr",
    ios: "https://apps.apple.com/tr/app/on-mobil/id1584313693",
  },
  "on dijital bankacilik": {
    android: "https://play.google.com/store/apps/details?id=com.onbank.mobil&hl=tr",
    ios: "https://apps.apple.com/tr/app/on-mobil/id1584313693",
  },
  sekerbank: {
    android: "https://play.google.com/store/apps/details?id=tr.com.sekerbilisim.mbank&hl=tr",
    ios: "https://apps.apple.com/tr/app/%C5%9Feker-mobil/id626133531",
  },
  "şekerbank": {
    android: "https://play.google.com/store/apps/details?id=tr.com.sekerbilisim.mbank&hl=tr",
    ios: "https://apps.apple.com/tr/app/%C5%9Feker-mobil/id626133531",
  },
  "kuveyt türk": {
    android: "https://play.google.com/store/apps/details?id=com.kuveytturk.mobil&hl=tr",
    ios: "https://apps.apple.com/tr/app/kuveyt-t%C3%BCrk-mobil/id840914223",
  },
  "albaraka türk": {
    android: "https://play.google.com/store/apps/details?id=com.albarakaapp&hl=tr",
    ios: "https://apps.apple.com/tr/app/albaraka-mobil/id1428860724",
  },
  "türkiye finans": {
    android: "https://play.google.com/store/apps/details?id=com.tfkb&hl=tr",
    ios: "https://apps.apple.com/tr/app/t%C3%BCrkiye-finans-mobil/id634936591",
  },
  "turkiye finans": {
    android: "https://play.google.com/store/apps/details?id=com.tfkb&hl=tr",
    ios: "https://apps.apple.com/tr/app/t%C3%BCrkiye-finans-mobil/id634936591",
  },
  "vakıf katılım": {
    android: "https://play.google.com/store/apps/details?id=com.vakifkatilim.mobil&hl=tr",
    ios: "https://apps.apple.com/tr/app/vak%C4%B1f-kat%C4%B1l%C4%B1m-mobile/id1144383102",
  },
  "vakif katilim": {
    android: "https://play.google.com/store/apps/details?id=com.vakifkatilim.mobil&hl=tr",
    ios: "https://apps.apple.com/tr/app/vak%C4%B1f-kat%C4%B1l%C4%B1m-mobile/id1144383102",
  },
  "ziraat katılım": {
    android: "https://play.google.com/store/apps/details?id=com.ziraatkatilim.mobilebanking&hl=tr",
    ios: "https://apps.apple.com/tr/app/ziraat-kat%C4%B1l%C4%B1m/id1181873648",
  },
  "ziraat katilim": {
    android: "https://play.google.com/store/apps/details?id=com.ziraatkatilim.mobilebanking&hl=tr",
    ios: "https://apps.apple.com/tr/app/ziraat-kat%C4%B1l%C4%B1m/id1181873648",
  },
  getirfinans: {
    android: "https://play.google.com/store/apps/details?id=com.getir&hl=tr",
    ios: "https://apps.apple.com/tr/app/getir-groceries-food-beyond/id995280265",
  },
});
const BANK_PRODUCT_DETAIL_LINKS = Object.freeze({
  akbank: {
    need: "https://www.akbank.com/krediler/ihtiyac-kredileri",
    housing: "https://www.akbank.com/krediler/konut-kredileri/akbank-konut-kredisi",
    vehicle: "https://www.akbank.com/krediler/tasit-kredileri/ikinci-el-tasit-kredisi",
    kobi: "https://www.akbank.com/kurumsal/krediler/ticari-krediler/ticari-kredi-faiz-oranlari",
  },
  "garanti bbva": {
    need: "https://www.garantibbva.com.tr/tr/bireysel_ihtiyac_kredisi",
    housing: "https://www.garantibbva.com.tr/tr/kendim-icin/krediler/konut-kredisi",
    vehicle: "https://www.garantibbva.com.tr/krediler/444-otom",
    kobi: "https://www.garantibbva.com.tr/hesap_mak",
  },
  qnb: {
    housing: "https://www.qnb.com.tr/standart-konut-kredisi",
    vehicle: "https://www.qnb.com.tr/tasit-otomobil-kredisi",
    kobi: "https://www.qnb.com.tr/isim-icin/kobi/krediler/kobi-destek-kredileri/diger-krediler",
  },
  "yapı kredi": {
    need: "https://www.yapikredi.com.tr/kredi/ihtiyac-kredisi/",
    housing: "https://www.yapikredi.com.tr/kredi/konut-kredisi/",
    vehicle: "https://www.yapikredi.com.tr/bireysel-bankacilik/krediler/tasit-kredisi/",
    kobi: "https://www.yapikredi.com.tr/bireysel-bankacilik/krediler/esnek-hesap/",
  },
});
const ISBANK_PROFILE_DATA = Object.freeze({
  primaryProducts: [
    {
      kind: "loan",
      title: "İhtiyaç Kredisi",
      descriptionLines: ["Tutar: 1.000 - 2.000.000 TL", "Vade: 3 - 36 Ay"],
      amountLabel: "Kredi Tutarı",
      defaultAmount: 100000,
      rateMap: { 12: 4.45, 24: 4.19, 36: 4.09 },
      selectedTerm: 24,
      detailHref: "https://www.isbank.com.tr/ihtiyac-kredisi",
      featured: true,
    },
    {
      kind: "loan",
      title: "Konut Kredisi",
      descriptionLines: ["Tutar: Ekspertiz değeri değişimli", "Vade: 1 - 120 Ay"],
      amountLabel: "Kredi Tutarı",
      defaultAmount: 1000000,
      rateMap: { 60: 2.65, 120: 2.55 },
      insuranceOptions: [
        {
          label: "Hayat Sigortalı",
          rateMap: { 60: 2.65, 120: 2.55 },
          selected: true,
        },
        {
          label: "Hayat Sigortasız",
          rateMap: { 60: 3.01, 120: 2.94 },
        },
      ],
      selectedTerm: 120,
      detailHref: "https://www.isbank.com.tr/ev-kredisi",
    },
    {
      kind: "loan",
      title: "Taşıt Kredisi",
      descriptionLines: ["Tutar: 5.000 - 400.000 TL", "Vade: 1 - 48 Ay"],
      amountLabel: "Kredi Tutarı",
      defaultAmount: 100000,
      rateMap: { 12: 3.15, 24: 3.1, 48: 3.05 },
      insuranceOptions: [
        {
          label: "Hayat Sigortalı",
          rateMap: { 12: 3.15, 24: 3.1, 48: 3.05 },
          selected: true,
        },
        {
          label: "Hayat Sigortasız",
          rateMap: { 12: 3.45, 24: 3.4, 48: 3.35 },
        },
      ],
      selectedTerm: 24,
      detailHref: "https://www.isbank.com.tr/tasit-kredisi",
    },
    {
      kind: "loan",
      title: "Ek Hesap",
      descriptionLines: ["Tutar: 0 - 150.000 TL arasında", "Vade: 1 - 30 gün arasında"],
      amountLabel: "Kredi Tutarı",
      defaultAmount: 500000,
      rateMap: { 12: 3.68, 24: 3.79, 36: 3.92 },
      selectedTerm: 12,
      detailHref: "https://www.isbank.com.tr/ek-hesap",
    },
  ],
  secondaryProducts: [
    {
      kind: "loan",
      title: "Taksitli Nakit Avans",
      descriptionLines: ["Kısa vadeli nakit ihtiyacında taksitle ödenmek için kullanılabilir."],
      amountLabel: "Tutar",
      defaultAmount: 50000,
      rateMap: { 3: 4.25, 6: 4.35, 12: 4.49 },
      selectedTerm: 6,
      detailHref: "https://www.isbank.com.tr/vnakit-ihtiyaclariniz-icin",
    },
    {
      kind: "loan",
      title: "Nakit Avans",
      descriptionLines: ["Kısa vadeli nakit ihtiyacın karşılanmasında kullanılır."],
      amountLabel: "Tutar",
      defaultAmount: 35000,
      rateMap: { 3: 3.95, 6: 4.1, 12: 4.28 },
      selectedTerm: 6,
      detailHref: "https://www.isbank.com.tr/nakit-ihtiyaclariniz-icin",
    },
    {
      kind: "deposit",
      title: "Vadeli TL Mevduat",
      descriptionLines: ["Standart şube kanalından vadeli TL hesap açılşında kullanılır"],
      amountLabel: "Mevduat Tutarı",
      defaultAmount: 250000,
      rateMap: { 32: 41.5, 92: 43.0, 181: 44.25 },
      selectedTerm: 92,
      secondaryLabel: "Net Getiri",
      tertiaryLabel: "Vade Sonu Tutar",
      detailHref: "https://www.isbank.com.tr/vadeli-tl",
    },
    {
      kind: "deposit",
      title: "Dijital Vadeli Mevduat",
      descriptionLines: ["%39'a varan faiz oranları için İşCep’e giriş yapın."],
      amountLabel: "Mevduat Tutarı",
      defaultAmount: 400000,
      rateMap: { 32: 42.25, 92: 43.5, 181: 44.5 },
      selectedTerm: 92,
      secondaryLabel: "Net Getiri",
      tertiaryLabel: "Vade Sonu Tutar",
      detailHref: "https://www.isbank.com.tr/vadeli-tl",
    },
  ],
});
const BANK_LOGO_MAP = Object.freeze({
  "aktif bank": "./assets/banks/aktif-bank.svg",
  akbank: "./assets/banks/akbank.svg",
  "albaraka türk": "./assets/banks/albaraka-turk.svg",
  "alternatif bank": "./assets/banks/alternatif-bank.svg",
  anadolubank: "./assets/banks/anadolubank.svg",
  "burgan bank": "./assets/banks/on-dijital-bankacilik.svg",
  cepteteb: "./assets/banks/cepteteb.svg",
  denizbank: "./assets/banks/denizbank.svg",
  enpara: "./assets/banks/enpara.svg",
  "enpara.com": "./assets/banks/enpara.svg",
  fibabanka: "./assets/banks/fibabanka.svg",
  "garanti bbva": "./assets/banks/garanti-bbva.svg",
  getirfinans: "./assets/banks/getirfinans.svg",
  halkbank: "./assets/banks/halkbank.svg",
  hsbc: "./assets/banks/hsbc.svg",
  "icbc turkey": "./assets/banks/icbc-turkey.svg",
  ing: "./assets/banks/ing-official-site-transparent.png?v=2",
  ıng: "./assets/banks/ing-official-site-transparent.png?v=2",
  "ing bank": "./assets/banks/ing-official-site-transparent.png?v=2",
  "ıng bank": "./assets/banks/ing-official-site-transparent.png?v=2",
  "ing bank a.ş.": "./assets/banks/ing-official-site-transparent.png?v=2",
  "ing bank a.s.": "./assets/banks/ing-official-site-transparent.png?v=2",
  "ıng bank a.ş.": "./assets/banks/ing-official-site-transparent.png?v=2",
  "ıng bank a.s.": "./assets/banks/ing-official-site-transparent.png?v=2",
  "iş bankası": "./assets/banks/is-bankasi.svg",
  "is bankasi": "./assets/banks/is-bankasi.svg",
  "kuveyt türk": "./assets/banks/kuveyt-turk.svg",
  "n kolay": "./assets/banks/aktif-bank.svg",
  "odea": "./assets/banks/odeabank.svg",
  odeabank: "./assets/banks/odeabank.svg",
  "on dijital": "./assets/banks/on-dijital-bankacilik.svg",
  "on dijital bankacılık": "./assets/banks/on-dijital-bankacilik.svg",
  "on dijital bankacilik": "./assets/banks/on-dijital-bankacilik.svg",
  qnb: "./assets/banks/qnb.svg",
  sekerbank: "./assets/banks/sekerbank.svg",
  "şekerbank": "./assets/banks/sekerbank.svg",
  teb: "./assets/banks/teb.svg",
  "türkiye finans katılım bankası": "./assets/banks/turkiye-finans.svg",
  "turkiye finans katilim bankasi": "./assets/banks/turkiye-finans.svg",
  "vakıf katılım": "./assets/banks/vakif-katilim.svg",
  "vakif katilim": "./assets/banks/vakif-katilim.svg",
  vakıfbank: "./assets/banks/vakifbank.svg",
  vakifbank: "./assets/banks/vakifbank.svg",
  "yapı kredi": "./assets/banks/yapi-kredi.svg",
  "yapi kredi": "./assets/banks/yapi-kredi.svg",
  "ziraat bankası": "./assets/banks/ziraat-bankasi.svg",
  "ziraat bankasi": "./assets/banks/ziraat-bankasi.svg",
});
let layoutHeightLocked = false;
let panelHeightsLocked = false;
let suppressHashRouteSync = false;
let suppressHeaderHover = false;
let tefasFundTableLoaded = false;
let tefasFundRows = [];
let tefasFundSourceLabel = "bilinmiyor";
let tefasFundFetchedAtUnix = 0;
let currentInvestmentSectionKey = "";
let marketRefreshTimerId = null;
let currentBankProfileName = "İş Bankası";
let currentBankAppQrContext = null;

const state = {
  questions: [],
  currentIndex: 0,
  answers: {},
  source: "",
  sessionId: "",
  phase: "consent",
  consentAccepted: false,
};

const ui = {
  layoutShell: document.getElementById("layoutShell"),
  introPanel: document.querySelector(".intro-panel"),
  compactPanel: document.querySelector(".compact-panel"),
  mainCard: document.getElementById("mainCard"),
  authToggle: document.getElementById("authToggle"),
  brandHome: document.getElementById("brandHome"),
  authPopover: document.getElementById("authPopover"),
  bankAppQrModal: document.getElementById("bankAppQrModal"),
  bankAppQrBackdrop: document.getElementById("bankAppQrBackdrop"),
  bankAppQrClose: document.getElementById("bankAppQrClose"),
  bankAppQrBrand: document.getElementById("bankAppQrBrand"),
  bankAppQrDescription: document.getElementById("bankAppQrDescription"),
  bankAppQrApplyLink: document.getElementById("bankAppQrApplyLink"),
  bankAppQrImage: document.getElementById("bankAppQrImage"),
  bankFeeModal: document.getElementById("bankFeeModal"),
  bankFeeBackdrop: document.getElementById("bankFeeBackdrop"),
  bankFeeClose: document.getElementById("bankFeeClose"),
  bankFeeTitle: document.getElementById("bankFeeTitle"),
  bankFeeList: document.getElementById("bankFeeList"),
  bankAppRedirectPage: document.getElementById("bankAppRedirectPage"),
  bankAppRedirectBankBrand: document.getElementById("bankAppRedirectBankBrand"),
  bankAppRedirectTitle: document.getElementById("bankAppRedirectTitle"),
  bankAppRedirectStoreLink: document.getElementById("bankAppRedirectStoreLink"),
  bankAppRedirectApplyLink: document.getElementById("bankAppRedirectApplyLink"),
  bankAppRedirectManual: document.getElementById("bankAppRedirectManual"),
  signinTabButton: document.getElementById("signinTabButton"),
  signupTabButton: document.getElementById("signupTabButton"),
  signinForm: document.getElementById("signinForm"),
  signupForm: document.getElementById("signupForm"),
  apiBase: document.getElementById("apiBase"),
  stepLabel: document.getElementById("stepLabel"),
  stepCounter: document.getElementById("stepCounter"),
  progressFill: document.getElementById("progressFill"),
  consentView: document.getElementById("consentView"),
  consentCheckbox: document.getElementById("consentCheckbox"),
  questionBackButton: document.getElementById("questionBackButton"),
  questionView: document.getElementById("questionView"),
  resultShell: document.getElementById("resultShell"),
  resultView: document.getElementById("resultView"),
  questionTitle: document.getElementById("questionTitle"),
  questionMeta: document.getElementById("questionMeta"),
  answerArea: document.getElementById("answerArea"),
  mainActions: document.getElementById("mainActions"),
  openNeedLoanRates: document.getElementById("openNeedLoanRates"),
  openIsbankProfile: document.getElementById("openIsbankProfile"),
  openHomePage: document.getElementById("openHomePage"),
  openLoanPage: document.getElementById("openLoanPage"),
  openInvestmentPage: document.getElementById("openInvestmentPage"),
  openCalculationPage: document.getElementById("openCalculationPage"),
  loanRatesPage: document.getElementById("loanRatesPage"),
  bankDetailPage: document.getElementById("bankDetailPage"),
  bankDetailBrand: document.getElementById("bankDetailBrand"),
  bankDetailSections: document.getElementById("bankDetailSections"),
  loanRatesTitle: document.getElementById("loanRatesTitle"),
  loanRatesDate: document.getElementById("loanRatesDate"),
  loanRatesAmountInput: document.getElementById("loanRatesAmountInput"),
  loanRatesTermSelect: document.getElementById("loanRatesTermSelect"),
  loanRatesTableBody: document.getElementById("loanRatesTableBody"),
  loanRateCards: document.getElementById("loanRateCards"),
  loanBreadcrumbHome: document.getElementById("loanBreadcrumbHome"),
  loanRatesTabs: document.querySelectorAll(".loan-tab"),
  investmentPage: document.getElementById("investmentPage"),
  investmentBreadcrumbHome: document.getElementById("investmentBreadcrumbHome"),
  investmentFxCard: document.getElementById("investmentFxCard"),
  investmentStockCard: document.getElementById("investmentStockCard"),
  investmentFundCard: document.getElementById("investmentFundCard"),
  investmentGoldCard: document.getElementById("investmentGoldCard"),
  investmentSilverCard: document.getElementById("investmentSilverCard"),
  investmentFxSection: document.getElementById("investmentFxSection"),
  investmentStockSection: document.getElementById("investmentStockSection"),
  investmentFundSection: document.getElementById("investmentFundSection"),
  investmentGoldSection: document.getElementById("investmentGoldSection"),
  investmentSilverSection: document.getElementById("investmentSilverSection"),
  investmentFxBody: document.getElementById("investmentFxBody"),
  investmentFxMeta: document.getElementById("investmentFxMeta"),
  investmentGoldBody: document.getElementById("investmentGoldBody"),
  investmentGoldMeta: document.getElementById("investmentGoldMeta"),
  investmentSilverBody: document.getElementById("investmentSilverBody"),
  investmentSilverMeta: document.getElementById("investmentSilverMeta"),
  tefasFundBody: document.getElementById("tefasFundBody"),
  tefasFundMeta: document.getElementById("tefasFundMeta"),
  tefasFundSearchInput: document.getElementById("tefasFundSearchInput"),
  tefasFundSearchClear: document.getElementById("tefasFundSearchClear"),
  tefasFundSearchInfo: document.getElementById("tefasFundSearchInfo"),
  calculationPage: document.getElementById("calculationPage"),
  calcBreadcrumbHome: document.getElementById("calcBreadcrumbHome"),
  calcNeedLoanCard: document.getElementById("calcNeedLoanCard"),
  calcHousingLoanCard: document.getElementById("calcHousingLoanCard"),
  calcVehicleLoanCard: document.getElementById("calcVehicleLoanCard"),
  calcDepositCard: document.getElementById("calcDepositCard"),
  calcCompoundCard: document.getElementById("calcCompoundCard"),
  calcRealCard: document.getElementById("calcRealCard"),
  needLoanCalculatorTitle: document.getElementById("needLoanCalculatorTitle"),
  depositCalculatorTitle: document.getElementById("depositCalculatorTitle"),
  compoundCalculatorTitle: document.getElementById("compoundCalculatorTitle"),
  realCalculatorTitle: document.getElementById("realCalculatorTitle"),
  needLoanCalculator: document.getElementById("needLoanCalculator"),
  needCalcTabPrincipal: document.getElementById("needCalcTabPrincipal"),
  needCalcTabInstallment: document.getElementById("needCalcTabInstallment"),
  needCalcPanePrincipal: document.getElementById("needCalcPanePrincipal"),
  needCalcPaneInstallment: document.getElementById("needCalcPaneInstallment"),
  depositCalculator: document.getElementById("depositCalculator"),
  compoundCalculator: document.getElementById("compoundCalculator"),
  realCalculator: document.getElementById("realCalculator"),
  needCalcForm: document.getElementById("needCalcForm"),
  needPrincipal: document.getElementById("needPrincipal"),
  needTerm: document.getElementById("needTerm"),
  needRate: document.getElementById("needRate"),
  needCalcResult: document.getElementById("needCalcResult"),
  needCalcMonthly: document.getElementById("needCalcMonthly"),
  needCalcTotal: document.getElementById("needCalcTotal"),
  needCalcInterest: document.getElementById("needCalcInterest"),
  needCalcNote: document.getElementById("needCalcNote"),
  needCalcScheduleSection: document.getElementById("needCalcScheduleSection"),
  needCalcScheduleTitle: document.getElementById("needCalcScheduleTitle"),
  needCalcScheduleBody: document.getElementById("needCalcScheduleBody"),
  needInstallmentForm: document.getElementById("needInstallmentForm"),
  needInstallmentAmount: document.getElementById("needInstallmentAmount"),
  needInstallmentTerm: document.getElementById("needInstallmentTerm"),
  needInstallmentRateInput: document.getElementById("needInstallmentRateInput"),
  needInstallmentResult: document.getElementById("needInstallmentResult"),
  needInstallmentPrincipal: document.getElementById("needInstallmentPrincipal"),
  needInstallmentTotal: document.getElementById("needInstallmentTotal"),
  needInstallmentInterest: document.getElementById("needInstallmentInterest"),
  needInstallmentNote: document.getElementById("needInstallmentNote"),
  loanOffersPanel: document.getElementById("loanOffersPanel"),
  loanOffersTitle: document.getElementById("loanOffersTitle"),
  loanOffersMeta: document.getElementById("loanOffersMeta"),
  loanOffersList: document.getElementById("loanOffersList"),
  depositCalcForm: document.getElementById("depositCalcForm"),
  depositPrincipal: document.getElementById("depositPrincipal"),
  depositTermDays: document.getElementById("depositTermDays"),
  depositRate: document.getElementById("depositRate"),
  depositCalcResult: document.getElementById("depositCalcResult"),
  depositGrossReturn: document.getElementById("depositGrossReturn"),
  depositWithholdingAmount: document.getElementById("depositWithholdingAmount"),
  depositNetReturn: document.getElementById("depositNetReturn"),
  depositMaturityAmount: document.getElementById("depositMaturityAmount"),
  investmentDepositForm: document.getElementById("investmentDepositForm"),
  investmentDepositPrincipal: document.getElementById("investmentDepositPrincipal"),
  investmentDepositTermDays: document.getElementById("investmentDepositTermDays"),
  investmentDepositAccountTypeFilter: document.getElementById("investmentDepositAccountTypeFilter"),
  investmentDepositBankTypeFilter: document.getElementById("investmentDepositBankTypeFilter"),
  investmentDepositOfferTitle: document.getElementById("investmentDepositOfferTitle"),
  investmentDepositOffersList: document.getElementById("investmentDepositOffersList"),
  compoundCalcForm: document.getElementById("compoundCalcForm"),
  compoundPrincipal: document.getElementById("compoundPrincipal"),
  compoundFrequency: document.getElementById("compoundFrequency"),
  compoundRate: document.getElementById("compoundRate"),
  compoundRateType: document.getElementById("compoundRateType"),
  compoundTerm: document.getElementById("compoundTerm"),
  compoundTermUnit: document.getElementById("compoundTermUnit"),
  compoundCalcResult: document.getElementById("compoundCalcResult"),
  compoundFinalAmount: document.getElementById("compoundFinalAmount"),
  compoundTotalGain: document.getElementById("compoundTotalGain"),
  compoundEffectiveAnnualRate: document.getElementById("compoundEffectiveAnnualRate"),
  compoundPeriodGain: document.getElementById("compoundPeriodGain"),
  realCalcForm: document.getElementById("realCalcForm"),
  realInitialAmount: document.getElementById("realInitialAmount"),
  realFinalAmount: document.getElementById("realFinalAmount"),
  realInflationRate: document.getElementById("realInflationRate"),
  realBuyDate: document.getElementById("realBuyDate"),
  realSellDate: document.getElementById("realSellDate"),
  realCalcResult: document.getElementById("realCalcResult"),
  realResultInitial: document.getElementById("realResultInitial"),
  realResultFinal: document.getElementById("realResultFinal"),
  realResultNominalGain: document.getElementById("realResultNominalGain"),
  realResultNominalRate: document.getElementById("realResultNominalRate"),
  realResultInflationPeriod: document.getElementById("realResultInflationPeriod"),
  realResultRealGain: document.getElementById("realResultRealGain"),
  realResultRealRate: document.getElementById("realResultRealRate"),
  realResultInflationAdjusted: document.getElementById("realResultInflationAdjusted"),
  realCalcInfo: document.getElementById("realCalcInfo"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  restartButton: document.getElementById("restartButton"),
  resultLevel: document.getElementById("resultLevel"),
  resultScore: document.getElementById("resultScore"),
  scoreGrid: document.getElementById("scoreGrid"),
  priorityList: document.getElementById("priorityList"),
  plans: document.getElementById("plans"),
  resultDisclaimer: document.getElementById("resultDisclaimer"),
};

ui.prevButton.addEventListener("click", onPrev);
ui.nextButton.addEventListener("click", onNext);
ui.questionBackButton.addEventListener("click", onPrev);
ui.consentCheckbox.addEventListener("change", updatePrimaryActionState);
ui.restartButton.addEventListener("click", () => {
  void restartFlow();
});
setupAuthUi();
setupLoanRatesUi();
window.addEventListener("load", () => {
  scheduleInitialRouteSectionSync();
});

void boot();

async function boot() {
  state.currentIndex = 0;
  state.answers = {};
  state.sessionId = "";
  state.phase = "consent";
  state.consentAccepted = false;
  ui.consentCheckbox.checked = false;
  renderConsent();
  preloadMarketTables();
  lockInitialLayoutHeight();
  lockInitialPanelHeights();
  const shouldPrioritizeRoute = shouldPrioritizeInitialRoute(window.location.hash);
  if (shouldPrioritizeRoute) {
    applyRouteFromHash();
    scheduleInitialRouteSectionSync();
  }

  state.questions = await loadQuestions();
  await initializeSession();

  if (!shouldPrioritizeRoute) {
    applyRouteFromHash();
    scheduleInitialRouteSectionSync();
  }
}

function preloadMarketTables() {
  if (ui.investmentFxBody) {
    renderFxPriceTable(EMBEDDED_FX_FALLBACK_PAYLOAD.rows, EMBEDDED_FX_FALLBACK_PAYLOAD);
    void loadFxPriceTable({ silent: true });
  }

  if (ui.investmentGoldBody) {
    renderGoldPriceTable(
      EMBEDDED_GOLD_FALLBACK_PAYLOAD.rows,
      EMBEDDED_GOLD_FALLBACK_PAYLOAD,
    );
    void loadGoldPriceTable({ silent: true });
  }
}

function lockInitialLayoutHeight() {
  if (layoutHeightLocked || !ui.layoutShell) {
    return;
  }

  requestAnimationFrame(() => {
    const initialHeight = Math.round(ui.layoutShell.getBoundingClientRect().height);
    if (initialHeight <= 0) {
      return;
    }

    ui.layoutShell.style.height = `${initialHeight}px`;
    layoutHeightLocked = true;
  });
}

function lockInitialPanelHeights() {
  if (panelHeightsLocked) {
    return;
  }

  requestAnimationFrame(() => {
    const panels = [ui.introPanel, ui.compactPanel, ui.mainCard].filter(Boolean);
    if (panels.length === 0) {
      return;
    }

    let measuredAny = false;
    panels.forEach((panel) => {
      const height = Math.round(panel.getBoundingClientRect().height);
      if (height > 0) {
        panel.style.height = `${height}px`;
        panel.style.minHeight = `${height}px`;
        measuredAny = true;
      }
    });

    if (measuredAny) {
      panelHeightsLocked = true;
    }
  });
}

async function loadQuestions() {
  const apiBase = normalizeBaseUrl(ui.apiBase ? ui.apiBase.value : "");

  try {
    const response = await fetchWithTimeout(`${apiBase}/api/v1/questions`, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      headers: { Accept: "application/json" },
    }, FETCH_TIMEOUT_MS);

    if (!response.ok) {
      throw new Error(`question bank fetch failed: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error("question bank response has no questions");
    }

    state.source = "api";
    return data.questions;
  } catch (_apiError) {
    try {
      const localResponse = await fetchWithTimeout("../data/question_bank_tr.json", {}, 1500);
      if (!localResponse.ok) {
        throw new Error(`local question file fail: ${localResponse.status}`);
      }
      const localData = await localResponse.json();
      if (!Array.isArray(localData) || localData.length === 0) {
        throw new Error("local question file empty");
      }
      state.source = "local-json";
      return localData;
    } catch (_localError) {
      state.source = "fallback";
      return FALLBACK_QUESTIONS;
    }
  }
}

function normalizeBaseUrl(urlText) {
  const raw = String(urlText || "").trim();
  if (!raw) {
    return DEFAULT_API_BASE;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_API_BASE;
    }
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
  } catch (_error) {
    return DEFAULT_API_BASE;
  }
}

function onPrev() {
  if (state.phase !== "questions") {
    return;
  }

  if (state.currentIndex <= 0) {
    state.phase = "consent";
    renderConsent();
    return;
  }

  persistCurrentAnswer();
  void persistSessionAnswers();
  state.currentIndex -= 1;
  renderQuestion();
}

async function onNext() {
  if (ui.nextButton.disabled) {
    return;
  }

  if (state.phase === "consent") {
    if (!ui.consentCheckbox.checked) {
      alert("Devam etmek için açık rıza onayı vermelisin.");
      return;
    }

    state.consentAccepted = true;
    state.phase = "questions";
    renderQuestion();
    return;
  }

  if (state.phase !== "questions") {
    return;
  }

  const isValid = persistCurrentAnswer();
  if (!isValid) {
    return;
  }
  await persistSessionAnswers();

  const isLastQuestion = state.currentIndex >= state.questions.length - 1;
  if (isLastQuestion) {
    await submitAssessment();
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
}

function renderConsent() {
  closeAuthPopover();
  ui.resultShell.classList.add("hidden");
  ui.resultView.classList.add("hidden");
  ui.questionView.classList.add("hidden");
  ui.consentView.classList.remove("hidden");

  document.body.classList.remove("question-format");
  syncQuestionLayoutMode();
  ui.stepLabel.textContent = "KVKK";
  ui.stepCounter.textContent = "Adım 1 / 1";
  ui.progressFill.style.width = "0%";

  ui.prevButton.disabled = true;
  ui.prevButton.classList.add("hidden");
  ui.mainActions.classList.add("consent-align-right");
  ui.nextButton.disabled = !ui.consentCheckbox.checked;
  ui.nextButton.classList.remove("hidden");
  ui.nextButton.textContent = "Doğrula ve başla";
  ui.nextButton.classList.toggle("consent-pending", ui.nextButton.disabled);
}

function renderQuestion() {
  closeAuthPopover();
  ui.resultShell.classList.add("hidden");
  ui.resultView.classList.add("hidden");
  ui.consentView.classList.add("hidden");
  ui.questionView.classList.remove("hidden");

  syncQuestionLayoutMode();
  const question = state.questions[state.currentIndex];
  const total = state.questions.length;
  const step = state.currentIndex + 1;
  const progress = total === 0 ? 0 : Math.round((step / total) * 100);

  ui.stepLabel.textContent = SECTION_LABELS[question.section] || "Finans";
  ui.stepCounter.textContent = `Soru ${step} / ${total}`;
  ui.progressFill.style.width = `${progress}%`;

  ui.questionTitle.textContent = question.prompt;
  const metaText = metaTextForQuestion(question);
  ui.questionMeta.textContent = metaText;
  ui.questionMeta.classList.toggle("hidden", metaText.length === 0);

  ui.answerArea.innerHTML = "";
  renderInputForQuestion(question, state.answers[question.id]);

  ui.mainActions.classList.remove("consent-align-right");
  ui.prevButton.classList.add("hidden");
  ui.prevButton.disabled = true;
  ui.nextButton.classList.remove("hidden");
  if (step === total) {
    ui.nextButton.textContent = "Sonucu göster";
  } else {
    ui.nextButton.textContent = "Devam";
  }
  updatePrimaryActionState();
}

function syncQuestionLayoutMode() {
  const useQuestionFormat = state.phase === "questions";
  document.body.classList.remove("question-format");
  if (ui.mainCard) {
    ui.mainCard.classList.toggle("question-format-in-card", useQuestionFormat);
  }
}

function renderInputForQuestion(question, previousValue) {
  if (question.answer_type === "single_choice" && Array.isArray(question.options)) {
    const fragment = document.createDocumentFragment();

    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.dataset.value = String(option);

      const dot = document.createElement("span");
      dot.className = "choice-dot";
      dot.setAttribute("aria-hidden", "true");

      const text = document.createElement("span");
      text.className = "choice-text";
      text.textContent = String(option);

      button.appendChild(dot);
      button.appendChild(text);

      if (String(previousValue) === String(option)) {
        button.classList.add("selected");
      }

      button.addEventListener("click", () => {
        const buttons = ui.answerArea.querySelectorAll(".choice");
        buttons.forEach((entry) => entry.classList.remove("selected"));
        button.classList.add("selected");
        updatePrimaryActionState();
      });

      fragment.appendChild(button);
    });

    ui.answerArea.appendChild(fragment);
    return;
  }

  if (question.answer_type === "number" || question.answer_type === "currency") {
    const input = document.createElement("input");
    input.type = "number";
    input.className = "input";
    input.min = "0";
    input.step = "1";
    input.placeholder = "Değer gir";
    if (previousValue !== undefined) {
      input.value = String(previousValue);
    }
    input.addEventListener("input", updatePrimaryActionState);
    ui.answerArea.appendChild(input);
    return;
  }

  if (question.answer_type === "text") {
    const textarea = document.createElement("textarea");
    textarea.className = "textarea";
    textarea.maxLength = 260;
    textarea.placeholder = "Kısa ve net yaz";
    if (previousValue !== undefined) {
      textarea.value = String(previousValue);
    }
    textarea.addEventListener("input", updatePrimaryActionState);
    ui.answerArea.appendChild(textarea);
    return;
  }

  const fallbackInput = document.createElement("input");
  fallbackInput.type = "text";
  fallbackInput.className = "input";
  fallbackInput.placeholder = "Cevap gir";
  if (previousValue !== undefined) {
    fallbackInput.value = String(previousValue);
  }
  fallbackInput.addEventListener("input", updatePrimaryActionState);
  ui.answerArea.appendChild(fallbackInput);
}

function persistCurrentAnswer() {
  const question = state.questions[state.currentIndex];

  if (question.answer_type === "single_choice") {
    const selected = ui.answerArea.querySelector(".choice.selected");
    if (!selected && question.required) {
      alert("Devam etmek için bir seçim yap.");
      return false;
    }
    if (selected) {
      state.answers[question.id] = selected.dataset.value || "";
    }
    return true;
  }

  if (question.answer_type === "number" || question.answer_type === "currency") {
    const input = ui.answerArea.querySelector("input");
    const raw = input ? input.value : "";
    if (!raw && question.required) {
      alert("Devam etmek için bir değer gir.");
      return false;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      alert("Lütfen geçerli bir sayı gir.");
      return false;
    }
    state.answers[question.id] = parsed;
    return true;
  }

  if (question.answer_type === "text") {
    const textarea = ui.answerArea.querySelector("textarea");
    const value = textarea ? textarea.value.trim() : "";
    if (!value && question.required) {
      alert("Bu alan boş bırakılamaz.");
      return false;
    }
    state.answers[question.id] = value;
    return true;
  }

  const input = ui.answerArea.querySelector("input");
  const value = input ? input.value.trim() : "";
  if (!value && question.required) {
    alert("Bu alan boş bırakılamaz.");
    return false;
  }
  state.answers[question.id] = value;
  return true;
}

async function submitAssessment() {
  ui.nextButton.disabled = true;
  ui.nextButton.textContent = "Hesaplanıyor...";

  try {
    if (state.sessionId) {
      await persistSessionAnswers();
      const sessionResult = await fetchSessionAssessment(state.sessionId);
      renderResult(sessionResult, "api");
      return;
    }

    const payload = buildAssessmentPayload(state.answers);
    const apiBase = normalizeBaseUrl(ui.apiBase ? ui.apiBase.value : "");
    const response = await fetchWithTimeout(`${apiBase}/api/v1/assessment`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }, FETCH_TIMEOUT_MS);

    if (!response.ok) {
      throw new Error(`assessment failed: ${response.status}`);
    }

    const data = await response.json();
    renderResult(data, "api");
  } catch (_error) {
    const payload = buildAssessmentPayload(state.answers);
    const localData = runLocalAssessment(payload);
    renderResult(localData, "local-fallback");
  } finally {
    ui.nextButton.disabled = false;
    ui.nextButton.textContent = "Sonucu göster";
  }
}

function buildAssessmentPayload(answers) {
  const expenseKeys = ["q13", "q14", "q15", "q16", "q17", "q18", "q19"];
  const monthly_total_expense = expenseKeys.reduce(
    (sum, key) => sum + asNumber(answers[key]),
    0,
  );

  return {
    monthly_net_income: asNumber(answers.q07),
    monthly_total_expense,
    monthly_debt_payment: asNumber(answers.q25),
    emergency_fund_months: asNumber(answers.q30),
    had_recent_payment_delay: normalizeText(answers.q26) === "evet",
    goal_is_clear: String(answers.q34 || "").trim().length >= 8,
    has_goal_date: normalizeText(answers.q36) === "evet",
    has_monthly_saving_habit: ["her ay", "bazi aylar"].includes(
      normalizeText(answers.q20),
    ),
    tracks_expenses: normalizeText(answers.q38) === "planli",
  };
}

function runLocalAssessment(payload) {
  const cash_flow = scoreCashFlow(payload.monthly_net_income, payload.monthly_total_expense);
  const debt_pressure = scoreDebtPressure(
    payload.monthly_net_income,
    payload.monthly_debt_payment,
    payload.had_recent_payment_delay,
  );
  const safety_buffer = scoreSafetyBuffer(payload.emergency_fund_months);
  const goal_discipline = scoreGoalDiscipline(
    payload.goal_is_clear,
    payload.has_goal_date,
    payload.has_monthly_saving_habit,
    payload.tracks_expenses,
  );

  const total_score = Math.round(
    cash_flow * 0.3 + debt_pressure * 0.3 + safety_buffer * 0.25 + goal_discipline * 0.15,
  );

  const level = resolveLevel(total_score);

  return {
    scores: {
      cash_flow,
      debt_pressure,
      safety_buffer,
      goal_discipline,
      total_score,
    },
    guidance: {
      level,
      top_priorities: resolvePriorities({ cash_flow, debt_pressure, safety_buffer, goal_discipline }),
      plan_30_days: resolvePlan30(level),
      plan_60_days: resolvePlan60(level),
      plan_90_days: resolvePlan90(level),
    },
    disclaimer: "Bu çıktı bilgi amaçlıdır ve yatırım tavsiyesi değildir.",
  };
}

function scoreCashFlow(income, expense) {
  if (income <= 0) {
    return 0;
  }
  const ratio = (income - expense) / income;
  if (ratio >= 0.2) return 100;
  if (ratio >= 0.1) return 75;
  if (ratio >= 0) return 50;
  if (ratio >= -0.1) return 25;
  return 0;
}

function scoreDebtPressure(income, debt, delayed) {
  if (income <= 0) {
    return 0;
  }
  const ratio = debt / income;
  let base = 0;
  if (ratio <= 0.1) base = 100;
  else if (ratio <= 0.25) base = 75;
  else if (ratio <= 0.4) base = 50;
  else if (ratio <= 0.55) base = 25;

  const penalty = delayed ? 15 : 0;
  return clamp(base - penalty, 0, 100);
}

function scoreSafetyBuffer(months) {
  if (months >= 6) return 100;
  if (months >= 3) return 75;
  if (months >= 1) return 50;
  if (months > 0) return 25;
  return 0;
}

function scoreGoalDiscipline(isClear, hasDate, savesMonthly, tracks) {
  let score = 0;
  if (isClear) score += 25;
  if (hasDate) score += 25;
  if (savesMonthly) score += 25;
  if (tracks) score += 25;
  return score;
}

function resolveLevel(total) {
  if (total <= 39) return "Acil Toparlanma";
  if (total <= 59) return "Denge Kurma";
  if (total <= 79) return "Güçlendirme";
  return "Büyüme";
}

function resolvePriorities(scores) {
  const list = [
    [scores.cash_flow, "Aylık gelir-gider farkını pozitife çevir."],
    [scores.debt_pressure, "Borçları gelir oranına göre yeniden planla."],
    [scores.safety_buffer, "Acil durum fonunu en az 3 aya çıkar."],
    [scores.goal_discipline, "Net hedef ve tarih belirleyip aylık takip yap."],
  ];

  return list
    .sort((a, b) => a[0] - b[0])
    .slice(0, 3)
    .map((item) => item[1]);
}

function resolvePlan30(level) {
  if (level === "Acil Toparlanma") {
    return [
      "Tüm giderleri yaz ve zorunlu olmayanı azalt.",
      "Borç takvimini netleştir.",
      "Küçük bir acil durum hesabı aç.",
    ];
  }

  if (level === "Denge Kurma") {
    return ["Aylık bütçe limiti belirle.", "Borç sıralaması yap.", "Haftalık takip başlat."];
  }

  return [
    "Otomatik birikim talimatı kur.",
    "Acil fon hedefini yazılı hale getir.",
    "Gereksiz abonelikleri azalt.",
  ];
}

function resolvePlan60(level) {
  if (level === "Acil Toparlanma" || level === "Denge Kurma") {
    return [
      "Borçlarda ilk kapanış hedefini tamamla.",
      "Aylık açık varsa ikinci kesinti turu yap.",
      "Acil fonu 1 aya taşı.",
    ];
  }

  return [
    "Hedef tarihlerini takvime işle.",
    "Aylık birikim yüzdesini sabitle.",
    "Haftalık durum raporu al.",
  ];
}

function resolvePlan90(level) {
  if (level === "Acil Toparlanma") {
    return [
      "Bütçeyi kalıcı bir düzene oturt.",
      "Gecikmesiz ödeme serisi başlat.",
      "Acil fonu 1-2 ay seviyesine getir.",
    ];
  }

  if (level === "Denge Kurma") {
    return [
      "Borçlarda net azalış hedefini tamamla.",
      "Acil fonu 3 aya yaklaştır.",
      "Yıllık hedef kartı oluştur.",
    ];
  }

  return [
    "Uzun vadeli birikim planına geç.",
    "Yıllık hedefleri otomatik takip et.",
    "Risk seviyeni yılda bir ölç.",
  ];
}

function renderResult(data, source) {
  closeAuthPopover();
  state.phase = "result";
  document.body.classList.remove("question-format");
  syncQuestionLayoutMode();
  ui.resultShell.classList.remove("hidden");
  ui.consentView.classList.add("hidden");
  ui.questionView.classList.add("hidden");
  ui.resultView.classList.remove("hidden");
  ui.prevButton.disabled = true;
  ui.nextButton.disabled = true;
  ui.prevButton.classList.add("hidden");
  ui.nextButton.classList.add("hidden");

  ui.stepLabel.textContent = "Sonuç";
  ui.stepCounter.textContent = source === "api" ? "API sonucu" : "Yerel fallback";
  ui.progressFill.style.width = "100%";

  ui.resultLevel.textContent = data.guidance.level;
  ui.resultScore.textContent = `Toplam skor: ${data.scores.total_score} / 100`;

  ui.scoreGrid.innerHTML = "";
  const scoreEntries = [
    ["Nakit akışı", data.scores.cash_flow],
    ["Borç baskısı", data.scores.debt_pressure],
    ["Güvenlik tamponu", data.scores.safety_buffer],
    ["Hedef disiplini", data.scores.goal_discipline],
  ];

  scoreEntries.forEach(([label, value]) => {
    const box = document.createElement("article");
    box.className = "score-box";

    const key = document.createElement("p");
    key.className = "score-key";
    key.textContent = String(label);

    const val = document.createElement("p");
    val.className = "score-val";
    val.textContent = `${value}`;

    box.appendChild(key);
    box.appendChild(val);
    ui.scoreGrid.appendChild(box);
  });

  ui.priorityList.innerHTML = "";
  data.guidance.top_priorities.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = String(item);
    ui.priorityList.appendChild(li);
  });

  ui.plans.innerHTML = "";
  const planGroups = [
    ["30 gün", data.guidance.plan_30_days],
    ["60 gün", data.guidance.plan_60_days],
    ["90 gün", data.guidance.plan_90_days],
  ];

  planGroups.forEach(([title, list]) => {
    const box = document.createElement("article");
    box.className = "plan-box";

    const heading = document.createElement("h4");
    heading.textContent = String(title);
    box.appendChild(heading);

    const ul = document.createElement("ul");
    list.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = String(entry);
      ul.appendChild(li);
    });

    box.appendChild(ul);
    ui.plans.appendChild(box);
  });

  ui.resultDisclaimer.textContent = data.disclaimer || "Bilgi amaçlı çıktı";
}

async function restartFlow() {
  state.currentIndex = 0;
  state.answers = {};
  state.sessionId = "";
  state.phase = "consent";
  state.consentAccepted = false;
  ui.consentCheckbox.checked = false;
  ui.resultShell.classList.add("hidden");
  await initializeSession();

  ui.prevButton.disabled = false;
  ui.nextButton.disabled = false;
  ui.nextButton.classList.remove("hidden");

  renderConsent();
}

async function initializeSession() {
  if (state.source !== "api") {
    return;
  }

  try {
    const apiBase = normalizeBaseUrl(ui.apiBase ? ui.apiBase.value : "");
    const response = await fetchWithTimeout(`${apiBase}/api/v1/sessions`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      headers: { Accept: "application/json" },
    }, FETCH_TIMEOUT_MS);
    if (!response.ok) {
      throw new Error(`session create failed: ${response.status}`);
    }

    const data = await response.json();
    state.sessionId = String(data.session_id || "");
  } catch (_error) {
    state.sessionId = "";
  }
}

async function persistSessionAnswers() {
  if (!state.sessionId) {
    return;
  }

  try {
    const apiBase = normalizeBaseUrl(ui.apiBase ? ui.apiBase.value : "");
    const response = await fetchWithTimeout(
      `${apiBase}/api/v1/sessions/${encodeURIComponent(state.sessionId)}/answers`,
      {
        method: "PUT",
        mode: "cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ answers: state.answers }),
      },
      FETCH_TIMEOUT_MS,
    );

    if (!response.ok) {
      throw new Error(`session save failed: ${response.status}`);
    }
  } catch (_error) {
    state.sessionId = "";
  }
}

async function fetchSessionAssessment(sessionId) {
  const apiBase = normalizeBaseUrl(ui.apiBase ? ui.apiBase.value : "");
  const response = await fetchWithTimeout(
    `${apiBase}/api/v1/sessions/${encodeURIComponent(sessionId)}/assessment`,
    {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      headers: { Accept: "application/json" },
    },
    FETCH_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new Error(`session assessment failed: ${response.status}`);
  }

  return response.json();
}

function setupAuthUi() {
  if (
    !ui.authToggle ||
    !ui.authPopover ||
    !ui.signinTabButton ||
    !ui.signupTabButton ||
    !ui.signinForm ||
    !ui.signupForm
  ) {
    return;
  }

  ui.authToggle.addEventListener("click", () => {
    const isHidden = ui.authPopover.classList.contains("hidden");
    if (isHidden) {
      ui.authPopover.classList.remove("hidden");
      ui.authToggle.setAttribute("aria-expanded", "true");
      toggleAuthTab("signin");
      return;
    }

    closeAuthPopover();
  });

  ui.signinTabButton.addEventListener("click", () => {
    toggleAuthTab("signin");
  });

  ui.signupTabButton.addEventListener("click", () => {
    toggleAuthTab("signup");
  });

  ui.signinForm.addEventListener("submit", handleSignInSubmit);
  ui.signupForm.addEventListener("submit", handleSignUpSubmit);

  ui.authPopover.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || !(target instanceof Node)) {
      return;
    }

    if (ui.authPopover.classList.contains("hidden")) {
      return;
    }

    if (ui.authPopover.contains(target) || ui.authToggle.contains(target)) {
      return;
    }

    closeAuthPopover();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAuthPopover();
    }
  });
}

function setupLoanRatesUi() {
  if (!ui.loanRatesPage && !ui.calculationPage && !ui.investmentPage) {
    return;
  }

  if (ui.loanRatesAmountInput) {
    ui.loanRatesAmountInput.addEventListener("input", () => {
      ui.loanRatesAmountInput.value = formatAmountInput(ui.loanRatesAmountInput.value);
      syncLoanRatesFilterStateFromUi();
      renderLoanRatesPage(String(ui.loanRatesPage?.dataset.loanRatesTab || "need"));
    });
  }

  if (ui.loanRatesTermSelect) {
    ui.loanRatesTermSelect.addEventListener("change", () => {
      syncLoanRatesFilterStateFromUi();
      renderLoanRatesPage(String(ui.loanRatesPage?.dataset.loanRatesTab || "need"));
    });
  }

  ui.loanRatesTabs?.forEach((tabElement) => {
    tabElement.addEventListener("click", () => {
      const tabKey = String(tabElement.dataset.loanRatesTab || "need");
      renderLoanRatesPage(tabKey);
      updateRouteHash(buildLoanRatesHash(tabKey));
    });
  });

  if (ui.openNeedLoanRates) {
    ui.openNeedLoanRates.addEventListener("click", () => {
      openLoanRatesPage({ tabKey: "need" });
    });
  }

  setupHomeBankWallProfiles();

  if (ui.calcNeedLoanCard) {
    ui.calcNeedLoanCard.addEventListener("click", () => {
      revealLoanCalculator("need");
    });
  }

  if (ui.calcHousingLoanCard) {
    ui.calcHousingLoanCard.addEventListener("click", () => {
      revealLoanCalculator("housing");
    });
  }

  if (ui.calcVehicleLoanCard) {
    ui.calcVehicleLoanCard.addEventListener("click", () => {
      revealLoanCalculator("vehicle");
    });
  }

  if (ui.calcDepositCard) {
    ui.calcDepositCard.addEventListener("click", () => {
      revealLoanCalculator("deposit");
    });
  }

  if (ui.calcCompoundCard) {
    ui.calcCompoundCard.addEventListener("click", () => {
      revealLoanCalculator("compound");
    });
  }

  if (ui.calcRealCard) {
    ui.calcRealCard.addEventListener("click", () => {
      revealLoanCalculator("real");
    });
  }

  if (ui.openCalculationPage) {
    ui.openCalculationPage.addEventListener("click", (event) => {
      event.preventDefault();
      openCalculationPage();
    });
  }

  if (ui.openHomePage) {
    ui.openHomePage.addEventListener("click", (event) => {
      event.preventDefault();
      closeHeaderMegaMenus();
      closeBankDetailPage({ updateHash: false });
      closeLoanRatesPage({ updateHash: false });
      closeCalculationPage({ updateHash: false });
      closeInvestmentPage({ updateHash: false });
      updateRouteHash(ROUTE_HASH.home);
      setActiveHeaderNav("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (ui.openInvestmentPage) {
    ui.openInvestmentPage.addEventListener("click", (event) => {
      event.preventDefault();
      openInvestmentPage();
    });
  }

  if (ui.investmentFxCard) {
    ui.investmentFxCard.addEventListener("click", () => {
      revealInvestmentSection("fx");
    });
  }

  if (ui.investmentStockCard) {
    ui.investmentStockCard.addEventListener("click", () => {
      revealInvestmentSection("stock");
    });
  }

  if (ui.investmentFundCard) {
    ui.investmentFundCard.addEventListener("click", () => {
      revealInvestmentSection("fund");
    });
  }

  if (ui.tefasFundSearchInput) {
    ui.tefasFundSearchInput.addEventListener("input", () => {
      applyTefasFundFilter();
    });
  }

  if (ui.tefasFundSearchClear) {
    ui.tefasFundSearchClear.addEventListener("click", () => {
      if (ui.tefasFundSearchInput) {
        ui.tefasFundSearchInput.value = "";
        ui.tefasFundSearchInput.focus();
      }
      applyTefasFundFilter();
    });
  }

  if (ui.investmentGoldCard) {
    ui.investmentGoldCard.addEventListener("click", () => {
      revealInvestmentSection("gold");
    });
  }

  if (ui.investmentSilverCard) {
    ui.investmentSilverCard.addEventListener("click", () => {
      revealInvestmentSection("silver");
    });
  }

  document.querySelectorAll(".header-mega-card").forEach((menuCard) => {
    menuCard.addEventListener("click", () => {
      closeHeaderMegaMenus();
      const action = String(menuCard.dataset.navAction || "");

      if (action === "loan-rates") {
        const tabKey = String(menuCard.dataset.loanRatesTab || "need");
        openLoanRatesPage({ updateHash: false, tabKey });
        updateRouteHash(ROUTE_HASH.loan);
        return;
      }

      if (action === "calculator") {
        const loanType = String(menuCard.dataset.loanType || "need");
        openCalculationPage({ updateHash: false });
        revealLoanCalculator(loanType);
        updateRouteHash(ROUTE_HASH.calculation);
        return;
      }

      if (action === "investment-section") {
        const sectionKey = String(menuCard.dataset.sectionKey || "");
        openInvestmentPage({ updateHash: false });
        revealInvestmentSection(sectionKey, { updateHash: true, smoothScroll: true });
        return;
      }

      if (action === "investment-page") {
        openInvestmentPage();
      }
    });
  });

  document.querySelectorAll(".header-nav-item").forEach((navItem) => {
    let closeTimerId = 0;

    const openMenu = () => {
      releaseHeaderMegaMenuSuppression();
      window.clearTimeout(closeTimerId);
      navItem.classList.add("menu-open");
    };

    const closeMenu = () => {
      window.clearTimeout(closeTimerId);
      closeTimerId = window.setTimeout(() => {
        navItem.classList.remove("menu-open");
      }, 140);
    };

    navItem.addEventListener("mouseenter", openMenu);
    navItem.addEventListener("mouseleave", closeMenu);
    navItem.addEventListener("focusin", openMenu);
    navItem.addEventListener("focusout", () => {
      window.setTimeout(() => {
        const activeElement = document.activeElement;
        if (!activeElement || !navItem.contains(activeElement)) {
          navItem.classList.remove("menu-open");
        }
      }, 0);
    });
  });

  document.addEventListener("pointermove", (event) => {
    if (!suppressHeaderHover) {
      return;
    }

    const target = event.target;
    if (target instanceof Node && document.querySelector(".header-nav")?.contains(target)) {
      return;
    }

    releaseHeaderMegaMenuSuppression();
  });

  if (ui.loanBreadcrumbHome) {
    ui.loanBreadcrumbHome.addEventListener("click", (event) => {
      event.preventDefault();
      closeHeaderMegaMenus();
      closeLoanRatesPage();
      scrollHomeSectionIntoView();
    });
  }

  if (ui.calcBreadcrumbHome) {
    ui.calcBreadcrumbHome.addEventListener("click", (event) => {
      event.preventDefault();
      closeHeaderMegaMenus();
      closeCalculationPage();
      scrollHomeSectionIntoView();
    });
  }

  if (ui.investmentBreadcrumbHome) {
    ui.investmentBreadcrumbHome.addEventListener("click", (event) => {
      event.preventDefault();
      closeHeaderMegaMenus();
      closeInvestmentPage();
      scrollHomeSectionIntoView();
    });
  }

  if (ui.brandHome) {
    ui.brandHome.addEventListener("click", (event) => {
      event.preventDefault();
      closeHeaderMegaMenus();
      closeBankAppQrModal();
      closeBankAppRedirectPage();
      closeBankDetailPage({ updateHash: false });
      closeLoanRatesPage({ updateHash: false });
      closeCalculationPage({ updateHash: false });
      closeInvestmentPage({ updateHash: false });
      updateRouteHash(ROUTE_HASH.home);
      setActiveHeaderNav("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (ui.bankFeeModal && !ui.bankFeeModal.classList.contains("hidden")) {
      closeBankFeeModal();
      return;
    }

    if (ui.bankAppQrModal && !ui.bankAppQrModal.classList.contains("hidden")) {
      closeBankAppQrModal();
      return;
    }

    if (ui.bankAppRedirectPage && !ui.bankAppRedirectPage.classList.contains("hidden")) {
      closeBankAppRedirectPage();
      showHomePageContent();
      setActiveHeaderNav("home");
      updateRouteHash(ROUTE_HASH.home);
      return;
    }

    if (ui.loanRatesPage && !ui.loanRatesPage.classList.contains("hidden")) {
      closeLoanRatesPage();
      return;
    }

    if (ui.calculationPage && !ui.calculationPage.classList.contains("hidden")) {
      closeCalculationPage();
      return;
    }

    if (ui.investmentPage && !ui.investmentPage.classList.contains("hidden")) {
      closeInvestmentPage();
      return;
    }

    if (ui.bankDetailPage && !ui.bankDetailPage.classList.contains("hidden")) {
      closeBankDetailPage();
    }
  });

  window.addEventListener("hashchange", () => {
    if (suppressHashRouteSync) {
      suppressHashRouteSync = false;
      return;
    }
    applyRouteFromHash();
  });

  if (ui.bankAppQrClose) {
    ui.bankAppQrClose.addEventListener("click", () => {
      closeBankAppQrModal();
    });
  }

  if (ui.bankAppQrBackdrop) {
    ui.bankAppQrBackdrop.addEventListener("click", () => {
      closeBankAppQrModal();
    });
  }

  if (ui.bankFeeClose) {
    ui.bankFeeClose.addEventListener("click", () => {
      closeBankFeeModal();
    });
  }

  if (ui.bankFeeBackdrop) {
    ui.bankFeeBackdrop.addEventListener("click", () => {
      closeBankFeeModal();
    });
  }

  setupBankProductCards();
  setupNeedLoanCalculator();
}

function setupBankProductCards() {
  document.querySelectorAll("[data-bank-product-card]").forEach((cardElement) => {
    const amountInput = cardElement.querySelector('[data-role="amount"]');
    const termSelect = cardElement.querySelector('[data-role="term"]');
    const insuranceSelect = cardElement.querySelector('[data-role="insurance-select"]');
    const rateOutput = cardElement.querySelector('[data-role="rate"]');
    const installmentOutput = cardElement.querySelector('[data-role="installment"]');
    const totalPaymentOutput = cardElement.querySelector('[data-role="total-payment"]');
    const secondaryLabel = cardElement.querySelector('[data-role="label-secondary"]');
    const tertiaryLabel = cardElement.querySelector('[data-role="label-tertiary"]');

    if (
      !(amountInput instanceof HTMLInputElement) ||
      !(termSelect instanceof HTMLSelectElement) ||
      !(rateOutput instanceof HTMLElement) ||
      !(installmentOutput instanceof HTMLElement) ||
      !(totalPaymentOutput instanceof HTMLElement)
    ) {
      return;
    }

    const rateMap = parseBankProductRateMap(cardElement.dataset.rateMap || "");
    if (Object.keys(rateMap).length === 0) {
      return;
    }

    const productKind = String(cardElement.dataset.kind || "loan");
    const productLoanType = String(cardElement.dataset.loanType || "").trim().toLowerCase();
    if (secondaryLabel instanceof HTMLElement && cardElement.dataset.secondaryLabel) {
      secondaryLabel.textContent = String(cardElement.dataset.secondaryLabel);
    }
    if (tertiaryLabel instanceof HTMLElement && cardElement.dataset.tertiaryLabel) {
      tertiaryLabel.textContent = String(cardElement.dataset.tertiaryLabel);
    }

    const renderCardOutcome = () => {
      amountInput.value = formatAmountInput(amountInput.value);

      const principal = parseAmountInput(amountInput.value);
      const termMonths = Number.parseInt(termSelect.value, 10);
      const selectedInsuranceOption =
        insuranceSelect instanceof HTMLSelectElement
          ? insuranceSelect.selectedOptions[0] || null
          : null;
      const activeRateMap =
        selectedInsuranceOption instanceof HTMLOptionElement
          ? parseBankProductRateMap(selectedInsuranceOption.dataset.rateMap || "")
          : rateMap;
      const monthlyRatePercent = activeRateMap[String(termMonths)];

      if (
        !Number.isFinite(principal) ||
        principal <= 0 ||
        !Number.isFinite(termMonths) ||
        !Number.isFinite(monthlyRatePercent)
      ) {
        rateOutput.textContent = "-";
        installmentOutput.textContent = "-";
        totalPaymentOutput.textContent = "-";
        return;
      }

      rateOutput.textContent = `% ${formatPercentNumber(monthlyRatePercent)}`;

      if (productKind === "deposit") {
        const depositOutcome = calculateDepositOutcome(principal, monthlyRatePercent, termMonths);
        installmentOutput.textContent = `${formatTry(depositOutcome.netReturn)} TL`;
        totalPaymentOutput.textContent = `${formatTry(depositOutcome.maturityAmount)} TL`;
        return;
      }

      if (productKind === "kmh") {
        const estimatedInterest = principal * (monthlyRatePercent / 100) * termMonths;
        const totalRepayment = principal + estimatedInterest;
        installmentOutput.textContent = `${formatTry(estimatedInterest)} TL`;
        totalPaymentOutput.textContent = `${formatTry(totalRepayment)} TL`;
        return;
      }

      const effectiveMonthlyRate =
        productLoanType ? getEffectiveLoanMonthlyRate(monthlyRatePercent, productLoanType) : monthlyRatePercent;
      const monthlyPayment = calculateInstallment(principal, effectiveMonthlyRate, termMonths);
      const totalPayment = monthlyPayment * termMonths;
      installmentOutput.textContent = `${formatTryWithCents(monthlyPayment)} TL`;
      totalPaymentOutput.textContent = `${formatTry(totalPayment)} TL`;
    };

    amountInput.addEventListener("input", renderCardOutcome);
    amountInput.addEventListener("blur", renderCardOutcome);
    termSelect.addEventListener("change", renderCardOutcome);
    if (insuranceSelect instanceof HTMLSelectElement) {
      insuranceSelect.addEventListener("change", renderCardOutcome);
    }

    renderCardOutcome();
  });

  document.querySelectorAll("[data-bank-apply-button]").forEach((buttonElement) => {
    if (!(buttonElement instanceof HTMLButtonElement)) {
      return;
    }

    buttonElement.onclick = null;
    buttonElement.addEventListener("click", () => {
      const bankName = String(buttonElement.dataset.bankName || currentBankProfileName || "").trim();
      const productTitle = String(buttonElement.dataset.productTitle || "").trim();
      const applyHref = String(buttonElement.dataset.applyHref || "").trim();
      const isTouchLikeDevice = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;

      if (isTouchLikeDevice && applyHref) {
        window.open(applyHref, "_blank", "noopener,noreferrer");
        return;
      }

      openBankAppQrModal(bankName, productTitle);
    });
  });

  document.querySelectorAll("[data-bank-fee-button]").forEach((buttonElement) => {
    if (!(buttonElement instanceof HTMLButtonElement)) {
      return;
    }

    buttonElement.onclick = null;
    buttonElement.addEventListener("click", () => {
      const productTitle = String(buttonElement.dataset.productTitle || "").trim();
      let feeItems = [];
      try {
        feeItems = JSON.parse(String(buttonElement.dataset.feeItems || "[]"));
      } catch (_error) {
        feeItems = [];
      }
      openBankFeeModal(productTitle, feeItems);
    });
  });
}

function setupHomeBankWallProfiles() {
  document.querySelectorAll(".home-bank-wall-card").forEach((cardElement) => {
    const bankName = getBankNameFromWallCard(cardElement);
    if (!bankName) {
      return;
    }

    cardElement.dataset.bankProfile = bankName;
    cardElement.classList.add("is-clickable");

    if (!(cardElement instanceof HTMLButtonElement)) {
      cardElement.setAttribute("role", "button");
      cardElement.tabIndex = 0;
    }

    const openProfile = () => {
      closeHeaderMegaMenus();
      openBankDetailPage({ bankName });
    };

    cardElement.addEventListener("click", openProfile);
    cardElement.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProfile();
      }
    });
  });
}

function getBankNameFromWallCard(cardElement) {
  const logoElement = cardElement.querySelector("img");
  if (!(logoElement instanceof HTMLImageElement)) {
    return "";
  }

  return String(logoElement.alt || "")
    .replace(/\s+logosu$/i, "")
    .trim();
}

function buildBankDetailHash(bankName) {
  return `${BANK_ROUTE_PREFIX}${createBankSlug(bankName)}`;
}

function resolveBankNameFromHash(hashValue) {
  const normalizedHash = String(hashValue || "").trim().toLowerCase();
  if (!normalizedHash.startsWith(BANK_ROUTE_PREFIX)) {
    return "";
  }

  const slug = normalizedHash.slice(BANK_ROUTE_PREFIX.length);
  if (!slug) {
    return "";
  }

  const matchingCard = Array.from(document.querySelectorAll(".home-bank-wall-card")).find((cardElement) => {
    const bankName = cardElement.dataset.bankProfile || getBankNameFromWallCard(cardElement);
    return createBankSlug(bankName) === slug;
  });

  return matchingCard?.dataset.bankProfile || getBankNameFromWallCard(matchingCard || document.createElement("div"));
}

function createBankSlug(bankName) {
  return normalizeTefasSearchText(bankName)
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildBankProfileData(bankName) {
  const normalizedBankName = normalizeTefasSearchText(bankName);

  if (normalizedBankName === "iş bankası") {
    return {
      bankName: "İş Bankası",
      website: BANK_PROFILE_WEBSITE_MAP[normalizedBankName] || "",
      primaryProducts: ISBANK_PROFILE_DATA.primaryProducts,
      secondaryProducts: ISBANK_PROFILE_DATA.secondaryProducts,
    };
  }

  const website = BANK_PROFILE_WEBSITE_MAP[normalizedBankName] || "";
  const profileOverride = BANK_PROFILE_OVERRIDES[normalizedBankName];

  if (profileOverride) {
    const genericPrimaryProducts = profileOverride.disableGenericPrimaryProducts
      ? []
      : buildGenericBankLoanProducts(bankName);
    const genericSecondaryProducts = buildGenericBankDepositProducts(bankName);
    return {
      bankName,
      website,
      primaryProducts: mergeBankProfileProducts(
        profileOverride.primaryProducts,
        genericPrimaryProducts,
        bankName,
        website,
      ),
      secondaryProducts: mergeBankProfileProducts(
        profileOverride.secondaryProducts,
        genericSecondaryProducts,
        bankName,
        website,
      ),
    };
  }

  return {
    bankName,
    website,
    primaryProducts: normalizeBankProfileProducts(buildGenericBankLoanProducts(bankName), bankName, website),
    secondaryProducts: normalizeBankProfileProducts(
      buildGenericBankDepositProducts(bankName),
      bankName,
      website,
    ),
  };
}

function mergeBankProfileProducts(preferredProducts, fallbackProducts, bankName, website) {
  const mergedProducts = new Map();

  normalizeBankProfileProducts(preferredProducts, bankName, website).forEach((product) => {
    mergedProducts.set(normalizeTefasSearchText(product.title), product);
  });

  normalizeBankProfileProducts(fallbackProducts, bankName, website).forEach((product) => {
    const productKey = normalizeTefasSearchText(product.title);
    if (!mergedProducts.has(productKey)) {
      mergedProducts.set(productKey, product);
    }
  });

  return Array.from(mergedProducts.values());
}

function isParticipationBankName(bankName) {
  return PARTICIPATION_BANK_NAMES.has(normalizeTefasSearchText(bankName));
}

function normalizeBankProfileProducts(products, bankName, website) {
  const isParticipationBank = isParticipationBankName(bankName);

  return (products || [])
    .filter((product) => {
      const inferredLoanType = product?.kind === "loan" ? inferBankProductLoanType(product) : "";
      return inferredLoanType !== "kobi";
    })
    .map((product) => {
    const inferredLoanType = product.kind === "loan" ? inferBankProductLoanType(product) : "";
    const normalizedDefaultAmount = inferredLoanType === "housing"
      ? 1000000
      : inferredLoanType === "need" || inferredLoanType === "vehicle"
        ? 100000
        : product.defaultAmount;
    const normalizedProduct = {
      ...product,
      defaultAmount: normalizedDefaultAmount,
      detailHref: product.detailHref || website || "",
      applyHref: product.applyHref || product.detailHref || website || "",
      insuranceOptions: normalizeInsuranceOptions(product.insuranceOptions),
    };

    if (!isParticipationBank || normalizedProduct.kind !== "loan") {
      return normalizedProduct;
    }

    return {
      ...normalizedProduct,
      amountLabel:
        normalizedProduct.amountLabel === "Kredi Tutarı"
          ? "Finansman Tutarı"
          : normalizedProduct.amountLabel,
      rateLabel: "Kar Oranı",
      secondaryLabel:
        normalizedProduct.secondaryLabel === "Toplam Faiz"
          ? "Toplam Kar Payı"
          : normalizedProduct.secondaryLabel,
      tertiaryLabel:
        normalizedProduct.tertiaryLabel === "Toplam Faiz"
          ? "Toplam Kar Payı"
          : normalizedProduct.tertiaryLabel,
    };
    })
    .sort((leftProduct, rightProduct) => compareBankProfileProducts(leftProduct, rightProduct));
}

function normalizeInsuranceOptions(insuranceOptions) {
  if (!Array.isArray(insuranceOptions)) {
    return insuranceOptions;
  }

  return insuranceOptions.map((option) => {
    const label = String(option?.label || "").trim();
    if (label === "Hayat Sigortalı") {
      return { ...option, label: "Hayat sigortası var" };
    }
    if (label === "Hayat Sigortasız") {
      return { ...option, label: "Hayat sigortası yok" };
    }
    return option;
  });
}

function compareBankProfileProducts(leftProduct, rightProduct) {
  const leftRank = getBankProfileProductOrderRank(leftProduct);
  const rightRank = getBankProfileProductOrderRank(rightProduct);

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return String(leftProduct?.title || "").localeCompare(String(rightProduct?.title || ""), "tr");
}

function getBankProfileProductOrderRank(product) {
  const kind = String(product?.kind || "");
  if (kind === "loan") {
    const inferredLoanType = inferBankProductLoanType(product);
    const loanRankMap = {
      need: 0,
      housing: 1,
      vehicle: 2,
    };
    return loanRankMap[inferredLoanType] ?? 10;
  }

  if (kind === "deposit") {
    return 20;
  }

  if (kind === "kmh") {
    return 30;
  }

  return 40;
}

function buildGenericBankLoanProducts(bankName) {
  const normalizedBankName = normalizeTefasSearchText(bankName);
  const loanTypeOrder = ["need", "housing", "vehicle"];

  return loanTypeOrder
    .map((loanTypeKey, index) => {
      const typeConfig = BANK_PRODUCT_TYPE_CONFIG[loanTypeKey];
      if (!typeConfig) {
        return null;
      }

      const defaultTerm = typeConfig.terms[0]?.value || 12;
      const fallbackRate = GENERIC_BANK_FALLBACK_RATES[loanTypeKey];
      const resolvedRate = fallbackRate;

      if (!Number.isFinite(resolvedRate)) {
        return null;
      }

      const rateMap = (typeConfig.terms || []).reduce((accumulator, termOption) => {
        if (Number.isFinite(resolvedRate) && Number.isFinite(termOption?.value)) {
          accumulator[termOption.value] = resolvedRate;
        }
        return accumulator;
      }, {});

      return {
        kind: "loan",
        title: typeConfig.title,
        descriptionLines: typeConfig.descriptionLines,
        amountLabel: typeConfig.amountLabel,
        defaultAmount: typeConfig.defaultAmount,
        rateMap,
        selectedTerm: defaultTerm,
        detailHref: BANK_PRODUCT_DETAIL_LINKS[normalizedBankName]?.[loanTypeKey] || "",
        applyHref:
          BANK_PRODUCT_DETAIL_LINKS[normalizedBankName]?.[loanTypeKey] ||
          BANK_PROFILE_WEBSITE_MAP[normalizedBankName] ||
          "",
        featured: index === 0,
      };
    })
    .filter(Boolean);
}

function buildGenericBankDepositProducts(bankName) {
  const normalizedBankName = normalizeTefasSearchText(bankName);

  return DEPOSIT_OFFER_CATALOG.filter(
    (offer) => normalizeTefasSearchText(offer.bank) === normalizedBankName,
  ).map((offer) => ({
    kind: "deposit",
    title: offer.product,
    descriptionLines: [offer.note],
    amountLabel: "Mevduat Tutarı",
    defaultAmount: 250000,
    rateMap: { 32: offer.annualRate },
    selectedTerm: 32,
    secondaryLabel: "Net Getiri",
    tertiaryLabel: "Vade Sonu Tutar",
    applyHref: BANK_PROFILE_WEBSITE_MAP[normalizedBankName] || "",
  }));
}

function getBankProductLinks(bankName, productTitle) {
  const profile = buildBankProfileData(bankName);
  const normalizedProductTitle = normalizeTefasSearchText(productTitle);
  const products = [...profile.primaryProducts, ...profile.secondaryProducts];
  const matchedProduct = products.find(
    (product) => normalizeTefasSearchText(product.title) === normalizedProductTitle,
  );

  return {
    detailHref: matchedProduct?.detailHref || "",
    applyHref: matchedProduct?.applyHref || matchedProduct?.detailHref || profile.website || "",
  };
}

function renderBankDetailPage(bankName) {
  if (!(ui.bankDetailBrand instanceof HTMLElement) || !(ui.bankDetailSections instanceof HTMLElement)) {
    return;
  }

  const profile = buildBankProfileData(bankName);
  currentBankProfileName = profile.bankName;

  ui.bankDetailBrand.replaceChildren(createBankDetailBrand(profile));

  const fragment = document.createDocumentFragment();

  if (profile.primaryProducts.length > 0) {
    fragment.append(createBankProductShowcase(profile.primaryProducts, profile.bankName));
  }

  if (profile.secondaryProducts.length > 0) {
    fragment.append(createBankProductShowcase(profile.secondaryProducts, profile.bankName));
  }

  if (profile.primaryProducts.length === 0 && profile.secondaryProducts.length === 0) {
    fragment.append(createBankDetailEmptyState(profile.bankName));
  }

  ui.bankDetailSections.replaceChildren(fragment);
  setupBankProductCards();
}

function createBankDetailBrand(profile) {
  const wrapper = document.createElement(profile.website ? "a" : "div");
  wrapper.className = "bank-detail-logo-link";

  if (profile.website) {
    wrapper.href = profile.website;
    wrapper.target = "_blank";
    wrapper.rel = "noopener noreferrer";
    wrapper.setAttribute("aria-label", `${profile.bankName} sitesini yeni sekmede aç`);
  }

  const logoElement = createBankLogoElement(profile.bankName, "bank-detail-logo");
  if (logoElement) {
    wrapper.append(logoElement);
    return wrapper;
  }

  const fallbackText = document.createElement("strong");
  fallbackText.className = "bank-detail-logo-fallback";
  fallbackText.textContent = profile.bankName;
  wrapper.append(fallbackText);
  return wrapper;
}

function getBankAppStoreLinks(bankName) {
  const normalizedBankName = normalizeTefasSearchText(bankName);
  const directLinks = BANK_MOBILE_APP_STORE_LINKS[normalizedBankName];
  if (directLinks) {
    return directLinks;
  }
  const appQuery = BANK_MOBILE_APP_QUERY_MAP[normalizedBankName] || bankName;
  const encodedQuery = encodeURIComponent(appQuery);
  return {
    android: `https://play.google.com/store/search?q=${encodedQuery}&c=apps&hl=tr`,
    ios: `https://apps.apple.com/tr/search?term=${encodedQuery}`,
  };
}

function buildBankAppRedirectHash(bankName, productTitle) {
  const params = new URLSearchParams();
  params.set("bank", bankName);
  if (productTitle) {
    params.set("product", productTitle);
  }
  return `${BANK_APP_REDIRECT_ROUTE_PREFIX}?${params.toString()}`;
}

function buildAbsoluteBankAppRedirectUrl(bankName, productTitle) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${buildBankAppRedirectHash(bankName, productTitle)}`;
}

function buildQrImageUrl(rawText) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=0&data=${encodeURIComponent(rawText)}`;
}

function closeBankAppQrModal() {
  if (ui.bankAppQrModal) {
    ui.bankAppQrModal.classList.add("hidden");
  }
  document.body.classList.remove("bank-app-qr-open");
  currentBankAppQrContext = null;
}

function closeBankFeeModal() {
  if (ui.bankFeeModal) {
    ui.bankFeeModal.classList.add("hidden");
  }
  document.body.classList.remove("bank-app-qr-open");
}

function openBankFeeModal(productTitle, feeItems) {
  if (!ui.bankFeeModal || !ui.bankFeeTitle || !ui.bankFeeList) {
    return;
  }

  ui.bankFeeTitle.textContent = productTitle ? `${productTitle} ücretleri` : "Ücretler";
  ui.bankFeeList.replaceChildren();

  const normalizedItems = Array.isArray(feeItems) && feeItems.length > 0
    ? feeItems
    : [
        { label: "Tahsis Ücreti", value: "-" },
        { label: "Hayat Sigortası", value: "-" },
      ];

  normalizedItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "bank-fee-item";
    const label = document.createElement("span");
    label.textContent = String(item?.label || "-");
    row.append(label);
    ui.bankFeeList.append(row);
  });

  ui.bankFeeModal.classList.remove("hidden");
  document.body.classList.add("bank-app-qr-open");
}

function openBankAppQrModal(bankName, productTitle) {
  if (
    !ui.bankAppQrModal ||
    !ui.bankAppQrBrand ||
    !ui.bankAppQrDescription ||
    !ui.bankAppQrApplyLink ||
    !ui.bankAppQrImage ||
    !ui.bankAppQrClose
  ) {
    return;
  }

  const qrTargetUrl = buildAbsoluteBankAppRedirectUrl(bankName, productTitle);
  const productLinks = getBankProductLinks(bankName, productTitle);
  currentBankAppQrContext = {
    bankName,
    productTitle,
    applyHref: productLinks.applyHref,
  };
  const qrBrandLogo = createBankLogoElement(bankName, "bank-app-qr-brand-logo");
  if (qrBrandLogo) {
    ui.bankAppQrBrand.replaceChildren(qrBrandLogo);
  } else {
    ui.bankAppQrBrand.textContent = bankName;
  }
  ui.bankAppQrDescription.textContent = "Başvurunu tamamlamak için QR kodunu okut.";
  if (productLinks.applyHref) {
    ui.bankAppQrApplyLink.href = productLinks.applyHref;
    ui.bankAppQrApplyLink.classList.remove("hidden");
  } else {
    ui.bankAppQrApplyLink.href = "#";
    ui.bankAppQrApplyLink.classList.add("hidden");
  }
  ui.bankAppQrImage.src = buildQrImageUrl(qrTargetUrl);
  ui.bankAppQrImage.alt = `${bankName} mobil uygulamasına yönlendiren QR kod`;

  ui.bankAppQrModal.classList.remove("hidden");
  document.body.classList.add("bank-app-qr-open");
}

function detectMobileStorePreference() {
  const userAgent = navigator.userAgent || "";
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "ios";
  }
  if (/android/i.test(userAgent)) {
    return "android";
  }
  return "android";
}

function renderBankAppRedirectPage(bankName, productTitle) {
  if (
    !ui.bankAppRedirectPage ||
    !ui.bankAppRedirectBankBrand ||
    !ui.bankAppRedirectTitle ||
    !ui.bankAppRedirectStoreLink ||
    !ui.bankAppRedirectApplyLink ||
    !ui.bankAppRedirectManual
  ) {
    return;
  }

  const links = getBankAppStoreLinks(bankName);
  const productLinks = getBankProductLinks(bankName, productTitle);
  const redirectLogo = createBankLogoElement(bankName, "bank-app-redirect-bank-logo");
  if (redirectLogo) {
    ui.bankAppRedirectBankBrand.replaceChildren(redirectLogo);
  } else {
    ui.bankAppRedirectBankBrand.textContent = bankName;
  }
  ui.bankAppRedirectTitle.textContent = productTitle
    ? `${bankName} ${productTitle} için mobil uygulamaya yönlendiriliyorsunuz`
    : `${bankName} mobil uygulamasına yönlendiriliyorsunuz`;
  const targetStore = detectMobileStorePreference();
  const targetHref = targetStore === "ios" ? links.ios : links.android;
  ui.bankAppRedirectStoreLink.href = targetHref;
  if (productLinks.applyHref) {
    ui.bankAppRedirectApplyLink.href = productLinks.applyHref;
    ui.bankAppRedirectApplyLink.classList.remove("hidden");
  } else {
    ui.bankAppRedirectApplyLink.href = "#";
    ui.bankAppRedirectApplyLink.classList.add("hidden");
  }
  ui.bankAppRedirectManual.textContent = "Uygun mağaza cihazına göre otomatik seçilir.";
  closeBankAppQrModal();

  hideHomePageContent();
  ui.loanRatesPage?.classList.add("hidden");
  ui.bankDetailPage?.classList.add("hidden");
  ui.calculationPage?.classList.add("hidden");
  ui.investmentPage?.classList.add("hidden");
  ui.bankAppRedirectPage.classList.remove("hidden");
  syncSubpageBodyClasses();
  window.scrollTo({ top: 0, behavior: "auto" });

  window.setTimeout(() => {
    window.location.href = targetHref;
  }, 1100);
}

function closeBankAppRedirectPage() {
  if (ui.bankAppRedirectPage) {
    ui.bankAppRedirectPage.classList.add("hidden");
  }
  syncSubpageBodyClasses();
}

function createBankProductShowcase(products, bankName) {
  const section = document.createElement("section");
  section.className = "bank-product-showcase";

  const grid = document.createElement("div");
  grid.className = "bank-product-grid";

  products.forEach((product) => {
    grid.append(createBankProductCard(product, bankName));
  });

  section.append(grid);
  return section;
}

function inferBankProductLoanType(product) {
  const normalizedTitle = normalizeTefasSearchText(product?.title || "");
  const normalizedHref = normalizeTefasSearchText(product?.detailHref || product?.applyHref || "");

  if (
    normalizedTitle.includes("konut") ||
    normalizedTitle.includes("ev kredisi") ||
    normalizedHref.includes("konut") ||
    normalizedHref.includes("ev-kredisi")
  ) {
    return "housing";
  }

  if (
    normalizedTitle.includes("taşıt") ||
    normalizedTitle.includes("tasit") ||
    normalizedTitle.includes("otomobil") ||
    normalizedTitle.includes("araba") ||
    normalizedHref.includes("tasit") ||
    normalizedHref.includes("otomobil")
  ) {
    return "vehicle";
  }

  if (
    normalizedTitle.includes("ihtiyaç") ||
    normalizedTitle.includes("ihtiyac") ||
    normalizedTitle.includes("tüketici") ||
    normalizedTitle.includes("tuketici") ||
    normalizedTitle.includes("hesaplı kredi") ||
    normalizedTitle.includes("hesapli kredi") ||
    normalizedTitle.includes("finansmanı") ||
    normalizedTitle.includes("finansmani") ||
    normalizedHref.includes("ihtiyac") ||
    normalizedHref.includes("tuketici")
  ) {
    return "need";
  }

  return "";
}

function createBankProductCard(product, bankName) {
  const article = document.createElement("article");
  article.className = `bank-product-card${product.featured ? " bank-product-card-featured" : ""}`;
  article.dataset.bankProductCard = "";
  article.dataset.bankName = bankName || currentBankProfileName;
  article.dataset.kind = product.kind || "loan";
  article.dataset.rateMap = buildBankProductRateMapText(product.rateMap);
  const inferredLoanType = product.kind === "loan" ? inferBankProductLoanType(product) : "";
  if (inferredLoanType) {
    article.dataset.loanType = inferredLoanType;
  }
  const insuranceOptions =
    product.kind === "loan" && !product.hideInsuranceSelect
      ? inferredLoanType === "need"
        ? [
            {
              label: "Hayat sigortası var",
              rateMap: product.rateMap || {},
              selected: true,
            },
          ]
        : Array.isArray(product.insuranceOptions) && product.insuranceOptions.length > 0
          ? product.insuranceOptions
          : [
              {
                label: "Hayat sigortası var",
                rateMap: product.rateMap || {},
                selected: true,
              },
              {
                label: "Hayat sigortası yok",
                rateMap: product.rateMap || {},
              },
            ]
      : [];

  if (product.secondaryLabel) {
    article.dataset.secondaryLabel = product.secondaryLabel;
  }
  if (product.tertiaryLabel) {
    article.dataset.tertiaryLabel = product.tertiaryLabel;
  }

  const header = document.createElement("header");
  header.className = "bank-product-head";

  const title = document.createElement("h3");
  title.textContent = product.title;
  header.append(title);

  (product.descriptionLines || []).forEach((lineText) => {
    const line = document.createElement("p");
    line.textContent = lineText;
    header.append(line);
  });

  const formGrid = document.createElement("div");
  formGrid.className = "bank-product-form-grid";
  if (insuranceOptions.length > 0) {
    formGrid.classList.add("bank-product-form-grid-with-insurance");
  }

  const amountField = document.createElement("label");
  amountField.className = "bank-product-field";
  const amountLabel = document.createElement("span");
  amountLabel.textContent = product.amountLabel || "Tutar";
  const amountShell = document.createElement("div");
  amountShell.className = "bank-product-input-shell";
  const amountInput = document.createElement("input");
  amountInput.type = "text";
  amountInput.inputMode = "numeric";
  amountInput.value = formatTry(product.defaultAmount || 0);
  amountInput.setAttribute("data-role", "amount");
  const amountSuffix = document.createElement("em");
  amountSuffix.textContent = "TL";
  amountShell.append(amountInput, amountSuffix);
  amountField.append(amountLabel, amountShell);

  const termField = document.createElement("label");
  termField.className = "bank-product-field";
  const termLabel = document.createElement("span");
  termLabel.textContent = "Vade";
  const termShell = document.createElement("div");
  termShell.className = "bank-product-input-shell bank-product-input-shell-select";
  const termSelect = document.createElement("select");
  termSelect.setAttribute("data-role", "term");

  getTermsFromRateMap(product.rateMap).forEach((termValue) => {
    const option = document.createElement("option");
    option.value = String(termValue);
    option.textContent = formatBankTermLabel(product.kind || "loan", termValue);
    option.selected = Number(termValue) === Number(product.selectedTerm || termValue);
    termSelect.append(option);
  });

  termShell.append(termSelect);
  termField.append(termLabel, termShell);
  formGrid.append(amountField, termField);

  let insuranceField = null;
  if (insuranceOptions.length > 0) {
    insuranceField = document.createElement("label");
    insuranceField.className = "bank-product-field bank-product-field-insurance";
    const insuranceShell = document.createElement("div");
    insuranceShell.className = "bank-product-input-shell bank-product-input-shell-select";
    const insuranceSelect = document.createElement("select");
    insuranceSelect.setAttribute("data-role", "insurance-select");

    insuranceOptions.forEach((option, index) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.label;
      optionElement.textContent = option.label;
      optionElement.dataset.rateMap = buildBankProductRateMapText(option.rateMap || {});
      optionElement.selected = Boolean(option.selected) || (!insuranceOptions.some((item) => item.selected) && index === 0);
      insuranceSelect.append(optionElement);
    });

    insuranceShell.append(insuranceSelect);
    insuranceField.append(insuranceShell);
    formGrid.append(insuranceField);
  }

  const tableCard = document.createElement("div");
  tableCard.className = "bank-product-table-card";
  [
    [product.rateLabel || "Faiz Oranı", "rate", "label-primary"],
    [product.secondaryLabel || "Aylık Taksit", "installment", "label-secondary"],
    [product.tertiaryLabel || "Toplam Ödeme", "total-payment", "label-tertiary"],
  ].forEach(([labelText, roleName, labelRole]) => {
    const row = document.createElement("div");
    row.className = "bank-product-table-row";
    const label = document.createElement("span");
    label.textContent = labelText;
    label.dataset.role = labelRole;
    const value = document.createElement("strong");
    value.dataset.role = roleName;
    value.textContent = "-";
    row.append(label, value);
    tableCard.append(row);
  });

  let feeCard = null;
  if ((product.kind || "loan") === "loan") {
    feeCard = document.createElement("button");
    feeCard.type = "button";
    feeCard.className = "bank-product-fee-card";
    feeCard.dataset.bankFeeButton = "";
    feeCard.dataset.productTitle = product.title;
    const housingFeeItems = [
      { label: "DASK", value: "594,15 TL" },
      { label: "Kıymet Takdir (Ekspertiz) Ücreti", value: "33.000,00 TL" },
      { label: "Tahsis Ücreti", value: "2.500,00 TL" },
      { label: "Hayat Sigortası", value: "5.604,00 TL" },
      { label: "Konut Sigortası", value: "3.898,00 TL" },
      { label: "Rehin Tesis Ücreti", value: "3.600,00 TL" },
    ];
    const vehicleFeeItems = [
      { label: "Kasko" },
      { label: "Tahsis Ücreti" },
      { label: "Hayat Sigortası" },
      { label: "Rehin Tesis Ücreti" },
    ];
    const defaultFeeItems = [
      { label: "Tahsis Ücreti", value: "575 TL" },
      { label: "Hayat Sigortası", value: "1.096 TL" },
    ];
    const feeItems = Array.isArray(product.feeItems) && product.feeItems.length > 0
      ? product.feeItems
      : article.dataset.loanType === "housing"
        ? housingFeeItems
        : article.dataset.loanType === "vehicle"
          ? vehicleFeeItems
          : defaultFeeItems;
    feeCard.dataset.feeItems = JSON.stringify(feeItems);
    feeCard.textContent = "Diğer ödemeler";
  }

  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "bank-product-action";
  actionButton.dataset.bankApplyButton = "";
  actionButton.dataset.bankName = bankName || currentBankProfileName;
  actionButton.dataset.productTitle = product.title;
  actionButton.dataset.applyHref = product.applyHref || product.detailHref || "";
  actionButton.textContent = "Başvur";

  article.append(header, formGrid, tableCard);
  if (feeCard) {
    article.append(feeCard);
  }
  article.append(actionButton);

  return article;
}

function createBankDetailEmptyState(bankName) {
  const section = document.createElement("section");
  section.className = "bank-product-showcase";

  const emptyCard = document.createElement("article");
  emptyCard.className = "bank-product-empty";

  const heading = document.createElement("h3");
  heading.textContent = `${bankName} için güncel ürün kartı hazırlanıyor`;
  const copy = document.createElement("p");
  copy.textContent = "Bu banka için mevcut kredi faiz verisi henüz eklenmedi. Sonraki adımda ürünler aynı kart yapısına taşınabilir.";
  emptyCard.append(heading, copy);
  section.append(emptyCard);
  return section;
}

function buildBankProductRateMapText(rateMap) {
  return Object.entries(rateMap || {})
    .map(([termValue, rateValue]) => `${termValue}:${rateValue}`)
    .join(";");
}

function getTermsFromRateMap(rateMap) {
  return Object.keys(rateMap || {})
    .map((termValue) => Number.parseInt(termValue, 10))
    .filter((termValue) => Number.isFinite(termValue))
    .sort((leftValue, rightValue) => leftValue - rightValue);
}

function formatBankTermLabel(productKind, termValue) {
  if (productKind === "deposit") {
    return `${termValue} Gün`;
  }

  return `${termValue} Ay`;
}

function parseBankProductRateMap(rawValue) {
  return String(rawValue || "")
    .split(";")
    .reduce((accumulator, item) => {
      const [termText, rateText] = item.split(":");
      const term = Number.parseInt(String(termText || "").trim(), 10);
      const rate = Number.parseFloat(String(rateText || "").trim());

      if (Number.isFinite(term) && Number.isFinite(rate)) {
        accumulator[String(term)] = rate;
      }

      return accumulator;
    }, {});
}

function closeHeaderMegaMenus() {
  suppressHeaderHover = true;
  document.body.classList.add("suppress-header-hover");
  document.querySelectorAll(".header-nav-item.menu-open").forEach((navItem) => {
    navItem.classList.remove("menu-open");
  });
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
}

function setActiveHeaderNav(navKey) {
  const navMap = {
    home: ui.openHomePage,
    loan: ui.openLoanPage,
    investment: ui.openInvestmentPage,
    calculation: ui.openCalculationPage,
  };

  Object.values(navMap).forEach((navElement) => {
    navElement?.classList.remove("is-active");
  });

  if (!navKey) {
    return;
  }

  navMap[navKey]?.classList.add("is-active");
}

function releaseHeaderMegaMenuSuppression() {
  suppressHeaderHover = false;
  document.body.classList.remove("suppress-header-hover");
}

function renderLoanRatesPage(tabKey = "need") {
  const resolvedTabKey = LOAN_RATES_PAGE_DATA[tabKey] ? tabKey : "need";
  const tabData = LOAN_RATES_PAGE_DATA[resolvedTabKey];
  if (!tabData) {
    return;
  }

  if (ui.loanRatesPage) {
    ui.loanRatesPage.dataset.loanRatesTab = resolvedTabKey;
  }

  ui.loanRatesTabs?.forEach((tabElement) => {
    const isActive = String(tabElement.dataset.loanRatesTab || "") === resolvedTabKey;
    tabElement.classList.toggle("active", isActive);
  });

  if (ui.loanRatesTitle) {
    ui.loanRatesTitle.textContent = tabData.title;
  }
  if (ui.loanRatesDate) {
    ui.loanRatesDate.textContent = tabData.dateLabel;
  }

  renderLoanRatesFilters(resolvedTabKey);

  if (ui.loanRatesTableBody) {
    const rowsFragment = document.createDocumentFragment();
    const { amount, term, loanType } = getLoanRatesFilterValues(resolvedTabKey);
    const comparisonRows = getLoanRatesComparisonRows(resolvedTabKey, term);
    comparisonRows.forEach((rowData) => {
      rowsFragment.append(
        createLoanRatesRow(
          buildLoanRatesTableRow(rowData, {
            principal: amount,
            termMonths: term,
            loanType,
          }),
        ),
      );
    });
    ui.loanRatesTableBody.replaceChildren(rowsFragment);
  }

  setupBankProductCards();
}

function getLoanRatesComparisonRows(tabKey, selectedTerm) {
  const targetLoanType = String(LOAN_RATES_FILTER_CONFIG[tabKey]?.loanType || "need");
  return HOME_BANK_WALL_BANKS.reduce((accumulator, bankName) => {
    const product = getComparableLoanProduct(bankName, targetLoanType);
    if (!product) {
      return accumulator;
    }

    const activeRateMap = getComparableRateMap(product);
    const availableTerms = getTermsFromRateMap(activeRateMap);
    if (availableTerms.length === 0) {
      return accumulator;
    }

    const requestedTerm = Number(selectedTerm);
    if (!availableTerms.includes(requestedTerm)) {
      return accumulator;
    }

    const rate = Number(activeRateMap[String(requestedTerm)]);
    if (!Number.isFinite(rate)) {
      return accumulator;
    }

    accumulator.push({
      bank: bankName,
      productTitle: product.title,
      rate,
      availableTerms,
      detailHref: product.detailHref || "",
      applyHref: product.applyHref || product.detailHref || "",
    });
    return accumulator;
  }, []).sort((leftRow, rightRow) => leftRow.rate - rightRow.rate);
}

function getComparableLoanProduct(bankName, targetLoanType) {
  const normalizedBankName = normalizeTefasSearchText(bankName);
  if (normalizedBankName !== "iş bankası" && !BANK_PROFILE_OVERRIDES[normalizedBankName]) {
    return null;
  }

  const profile = buildBankProfileData(bankName);
  const products = [...profile.primaryProducts, ...profile.secondaryProducts];
  return (
    products.find((product) => {
      if (product.kind !== "loan") {
        return false;
      }
      return inferBankProductLoanType(product) === targetLoanType;
    }) || null
  );
}

function getComparableRateMap(product) {
  if (!product || product.kind !== "loan") {
    return {};
  }

  const explicitInsuranceOptions = Array.isArray(product.insuranceOptions) ? product.insuranceOptions : [];
  const selectedOption =
    explicitInsuranceOptions.find((option) => option.selected) || explicitInsuranceOptions[0] || null;

  if (selectedOption && selectedOption.rateMap) {
    return selectedOption.rateMap;
  }

  return product.rateMap || {};
}

function renderLoanRatesFilters(tabKey) {
  const config = LOAN_RATES_FILTER_CONFIG[tabKey] || LOAN_RATES_FILTER_CONFIG.need;
  const state = loanRatesFilterState[tabKey] || {
    amount: config.defaultAmount,
    term: config.defaultTerm,
  };

  if (ui.loanRatesAmountInput) {
    ui.loanRatesAmountInput.value = formatAmountInput(state.amount);
  }

  if (ui.loanRatesTermSelect) {
    const optionsFragment = document.createDocumentFragment();
    config.terms.forEach((termValue) => {
      const option = document.createElement("option");
      option.value = String(termValue);
      option.textContent = `${termValue} Ay`;
      option.selected = Number(termValue) === Number(state.term || config.defaultTerm);
      optionsFragment.append(option);
    });
    ui.loanRatesTermSelect.replaceChildren(optionsFragment);
  }
}

function syncLoanRatesFilterStateFromUi() {
  const tabKey = String(ui.loanRatesPage?.dataset.loanRatesTab || "need");
  const config = LOAN_RATES_FILTER_CONFIG[tabKey] || LOAN_RATES_FILTER_CONFIG.need;
  const amount = parseAmountInput(ui.loanRatesAmountInput?.value || "");
  const term = Number.parseInt(String(ui.loanRatesTermSelect?.value || config.defaultTerm), 10);

  loanRatesFilterState[tabKey] = {
    amount: Number.isFinite(amount) && amount > 0 ? amount : config.defaultAmount,
    term: Number.isFinite(term) ? term : config.defaultTerm,
  };
}

function getLoanRatesFilterValues(tabKey) {
  const config = LOAN_RATES_FILTER_CONFIG[tabKey] || LOAN_RATES_FILTER_CONFIG.need;
  const state = loanRatesFilterState[tabKey] || {
    amount: config.defaultAmount,
    term: config.defaultTerm,
  };

  return {
    amount: Number.isFinite(state.amount) && state.amount > 0 ? state.amount : config.defaultAmount,
    term: Number.isFinite(state.term) ? state.term : config.defaultTerm,
    loanType: config.loanType,
  };
}

function buildLoanRatesTableRow(rowData, options = {}) {
  const principal = Number(options.principal);
  const termMonths = Number(options.termMonths);
  const loanType = String(options.loanType || "need");
  const nominalRate = Number(rowData.rate);

  if (
    !Number.isFinite(principal) ||
    principal <= 0 ||
    !Number.isFinite(termMonths) ||
    termMonths <= 0 ||
    !Number.isFinite(nominalRate)
  ) {
    return rowData;
  }

  const effectiveMonthlyRate = getEffectiveLoanMonthlyRate(nominalRate, loanType);
  const monthlyInstallment = calculateInstallment(principal, effectiveMonthlyRate, termMonths);
  const totalPayment = monthlyInstallment * termMonths;

  return {
    ...rowData,
    monthlyInstallment,
    totalPayment,
  };
}

function createLoanRatesHighlightCard(cardData, isPrimary) {
  const article = document.createElement("article");
  article.className = "deposit-offer-card loan-rate-card";

  const topRow = document.createElement("div");
  topRow.className = "deposit-offer-top";

  const headingWrap = document.createElement("div");
  headingWrap.className = "deposit-offer-heading";

  const badge = document.createElement("span");
  badge.className = `deposit-offer-badge${isPrimary ? " is-best" : ""}`;
  badge.textContent = isPrimary ? "Öne Çıkan Banka" : cardData.badge;
  headingWrap.append(badge);

  const logoElement = createBankLogoElement(cardData.bank, "deposit-offer-logo");
  if (logoElement) {
    headingWrap.append(logoElement);
  }

  const productName = document.createElement("p");
  productName.className = "deposit-offer-product";
  productName.textContent = cardData.product;
  headingWrap.append(productName);

  const rateWrap = document.createElement("div");
  rateWrap.className = "deposit-offer-rate-wrap";
  const rateLabel = document.createElement("span");
  rateLabel.className = "deposit-offer-rate-label";
  rateLabel.textContent = "Aylık Faiz";
  const rateValue = document.createElement("strong");
  rateValue.className = "deposit-offer-rate";
  rateValue.textContent = `%${cardData.monthlyRate.toFixed(2).replace(".", ",")}`;
  rateWrap.append(rateLabel, rateValue);

  topRow.append(headingWrap, rateWrap);

  const note = document.createElement("p");
  note.className = "deposit-offer-note";
  note.textContent = cardData.note;

  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "deposit-offer-action";
  actionButton.textContent = "Başvur";

  article.append(topRow, note, actionButton);
  return article;
}

function createLoanRatesRow(rowData) {
  const tr = document.createElement("tr");

  const bankCell = document.createElement("td");
  const bankWrap = document.createElement("div");
  bankWrap.className = "bank-logo-cell";
  const logoElement = createBankLogoElement(rowData.bank, "bank-logo-image");
  if (logoElement) {
    bankWrap.append(logoElement);
  }
  bankCell.append(bankWrap);

  const rateCell = document.createElement("td");
  rateCell.textContent = `% ${formatPercentNumber(rowData.rate)}`;

  const installmentCell = document.createElement("td");
  installmentCell.textContent = `${formatTry(rowData.monthlyInstallment)} ₺`;

  const totalCell = document.createElement("td");
  totalCell.textContent = `${formatTry(rowData.totalPayment)} ₺`;

  const actionCell = document.createElement("td");
  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "loan-apply-btn";
  actionButton.textContent = "Başvur";
  actionButton.dataset.bankApplyButton = "";
  actionButton.dataset.bankName = rowData.bank;
  actionButton.dataset.productTitle = rowData.productTitle || "";
  actionButton.dataset.applyHref = rowData.applyHref || rowData.detailHref || "";
  actionCell.append(actionButton);

  tr.append(bankCell, rateCell, installmentCell, totalCell, actionCell);
  return tr;
}

function openLoanRatesPage(options = {}) {
  const { updateHash = true, tabKey } = options;
  closeAuthPopover();
  closeBankAppRedirectPage();
  hideHomePageContent();
  if (ui.bankDetailPage) {
    ui.bankDetailPage.classList.add("hidden");
  }
  if (ui.calculationPage) {
    ui.calculationPage.classList.add("hidden");
  }
  if (ui.investmentPage) {
    ui.investmentPage.classList.add("hidden");
  }
  if (ui.loanRatesPage) {
    ui.loanRatesPage.classList.remove("hidden");
  }
  renderLoanRatesPage(String(tabKey || ui.loanRatesPage?.dataset.loanRatesTab || "need"));
  syncSubpageBodyClasses();
  setActiveHeaderNav("loan");
  if (updateHash) {
    updateRouteHash(buildLoanRatesHash(ui.loanRatesPage?.dataset.loanRatesTab || tabKey));
  }
}

function closeLoanRatesPage(options = {}) {
  const { updateHash = true } = options;
  if (ui.loanRatesPage) {
    ui.loanRatesPage.classList.add("hidden");
  }
  showHomePageContent();
  syncSubpageBodyClasses();
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.home);
  }
}

function openBankDetailPage(options = {}) {
  const { updateHash = true, bankName = currentBankProfileName } = options;
  closeAuthPopover();
  closeBankAppRedirectPage();
  hideHomePageContent();
  if (ui.loanRatesPage) {
    ui.loanRatesPage.classList.add("hidden");
  }
  if (ui.calculationPage) {
    ui.calculationPage.classList.add("hidden");
  }
  if (ui.investmentPage) {
    ui.investmentPage.classList.add("hidden");
  }
  renderBankDetailPage(bankName);
  if (ui.bankDetailPage) {
    ui.bankDetailPage.classList.remove("hidden");
  }
  syncSubpageBodyClasses();
  setActiveHeaderNav("");
  if (updateHash) {
    updateRouteHash(buildBankDetailHash(bankName));
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeBankDetailPage(options = {}) {
  const { updateHash = true } = options;
  if (ui.bankDetailPage) {
    ui.bankDetailPage.classList.add("hidden");
  }
  showHomePageContent();
  syncSubpageBodyClasses();
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.home);
  }
}

function openCalculationPage(options = {}) {
  const { updateHash = true } = options;
  closeAuthPopover();
  closeBankAppRedirectPage();
  hideHomePageContent();
  if (ui.bankDetailPage) {
    ui.bankDetailPage.classList.add("hidden");
  }
  if (ui.loanRatesPage) {
    ui.loanRatesPage.classList.add("hidden");
  }
  if (ui.investmentPage) {
    ui.investmentPage.classList.add("hidden");
  }
  if (ui.calculationPage) {
    ui.calculationPage.classList.remove("hidden");
  }
  const hasVisibleCalculator = [
    ui.needLoanCalculator,
    ui.depositCalculator,
    ui.compoundCalculator,
    ui.realCalculator,
  ].some((sectionElement) => sectionElement && !sectionElement.classList.contains("hidden"));
  if (!hasVisibleCalculator) {
    const defaultLoanType = String(ui.calculationPage?.dataset.loanType || "need");
    revealLoanCalculator(defaultLoanType);
  }
  syncSubpageBodyClasses();
  setActiveHeaderNav("calculation");
  if (updateHash) {
    updateRouteHash(buildCalculationHash(ui.calculationPage?.dataset.loanType || "need"));
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeCalculationPage(options = {}) {
  const { updateHash = true } = options;
  if (ui.calculationPage) {
    ui.calculationPage.classList.add("hidden");
  }
  showHomePageContent();
  syncSubpageBodyClasses();
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.home);
  }
}

function openInvestmentPage(options = {}) {
  const { updateHash = true, initialSectionKey = "" } = options;
  closeAuthPopover();
  closeBankAppRedirectPage();
  hideHomePageContent();
  if (ui.bankDetailPage) {
    ui.bankDetailPage.classList.add("hidden");
  }
  if (ui.loanRatesPage) {
    ui.loanRatesPage.classList.add("hidden");
  }
  if (ui.calculationPage) {
    ui.calculationPage.classList.add("hidden");
  }
  if (ui.investmentPage) {
    ui.investmentPage.classList.remove("hidden");
  }
  if (ui.investmentFxSection) {
    ui.investmentFxSection.classList.add("hidden");
  }
  if (ui.investmentStockSection) {
    ui.investmentStockSection.classList.add("hidden");
  }
  if (ui.investmentFundSection) {
    ui.investmentFundSection.classList.add("hidden");
  }
  if (ui.investmentGoldSection) {
    ui.investmentGoldSection.classList.add("hidden");
  }
  if (ui.investmentSilverSection) {
    ui.investmentSilverSection.classList.add("hidden");
  }
  ui.investmentFxCard?.classList.remove("is-active");
  ui.investmentStockCard?.classList.remove("is-active");
  ui.investmentFundCard?.classList.remove("is-active");
  ui.investmentGoldCard?.classList.remove("is-active");
  ui.investmentSilverCard?.classList.remove("is-active");
  currentInvestmentSectionKey = "";
  if (ui.investmentPage) {
    ui.investmentPage.dataset.sectionKey = "";
  }
  stopMarketRefreshTimer();
  syncSubpageBodyClasses();
  setActiveHeaderNav("investment");
  if (initialSectionKey) {
    revealInvestmentSection(initialSectionKey, { updateHash: false, smoothScroll: false });
    return;
  }
  if (updateHash) {
    updateRouteHash(buildInvestmentHash(currentInvestmentSectionKey || ui.investmentPage?.dataset.sectionKey || ""));
  }
}

function closeInvestmentPage(options = {}) {
  const { updateHash = true } = options;
  if (ui.investmentPage) {
    ui.investmentPage.classList.add("hidden");
  }
  if (ui.investmentFxSection) {
    ui.investmentFxSection.classList.add("hidden");
  }
  if (ui.investmentStockSection) {
    ui.investmentStockSection.classList.add("hidden");
  }
  if (ui.investmentFundSection) {
    ui.investmentFundSection.classList.add("hidden");
  }
  if (ui.investmentGoldSection) {
    ui.investmentGoldSection.classList.add("hidden");
  }
  if (ui.investmentSilverSection) {
    ui.investmentSilverSection.classList.add("hidden");
  }
  ui.investmentFxCard?.classList.remove("is-active");
  ui.investmentStockCard?.classList.remove("is-active");
  ui.investmentFundCard?.classList.remove("is-active");
  ui.investmentGoldCard?.classList.remove("is-active");
  ui.investmentSilverCard?.classList.remove("is-active");
  currentInvestmentSectionKey = "";
  stopMarketRefreshTimer();
  showHomePageContent();
  syncSubpageBodyClasses();
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.home);
  }
}

function hideHomePageContent() {
  if (ui.layoutShell) {
    ui.layoutShell.classList.add("hidden");
  }

  if (ui.resultShell) {
    ui.resultShell.classList.add("hidden");
  }
}

function showHomePageContent() {
  if (ui.layoutShell) {
    ui.layoutShell.classList.remove("hidden");
  }

  if (ui.resultShell) {
    const hasVisibleResult = Boolean(ui.resultView && !ui.resultView.classList.contains("hidden"));
    ui.resultShell.classList.toggle("hidden", !hasVisibleResult);
  }
}

function revealInvestmentSection(sectionKey, options = {}) {
  const { updateHash = true, smoothScroll = true } = options;
  if (!ui.investmentFxSection && !ui.investmentStockSection && !ui.investmentFundSection && !ui.investmentGoldSection && !ui.investmentSilverSection) {
    return;
  }

  const isFxSection = sectionKey === "fx";
  const isStockSection = sectionKey === "stock";
  const isFundSection = sectionKey === "fund";
  const isGoldSection = sectionKey === "gold";
  const isSilverSection = sectionKey === "silver";
  ui.investmentFxSection?.classList.toggle("hidden", !isFxSection);
  ui.investmentStockSection?.classList.toggle("hidden", !isStockSection);
  ui.investmentFundSection?.classList.toggle("hidden", !isFundSection);
  ui.investmentGoldSection?.classList.toggle("hidden", !isGoldSection);
  ui.investmentSilverSection?.classList.toggle("hidden", !isSilverSection);
  ui.investmentFxCard?.classList.toggle("is-active", isFxSection);
  ui.investmentStockCard?.classList.toggle("is-active", isStockSection);
  ui.investmentFundCard?.classList.toggle("is-active", isFundSection);
  ui.investmentGoldCard?.classList.toggle("is-active", isGoldSection);
  ui.investmentSilverCard?.classList.toggle("is-active", isSilverSection);
  currentInvestmentSectionKey = String(sectionKey || "");
  if (ui.investmentPage) {
    ui.investmentPage.dataset.sectionKey = currentInvestmentSectionKey;
  }

  if (updateHash) {
    updateRouteHash(buildInvestmentHash(sectionKey));
  }

  if (isFxSection) {
    void loadFxPriceTable({ forceRefresh: true });
  }

  if (smoothScroll && isFxSection && ui.investmentFxSection) {
    ui.investmentFxSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (smoothScroll && isStockSection && ui.investmentStockSection) {
    ui.investmentStockSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (isFundSection) {
    void loadTefasFundTable();
  }

  if (isGoldSection) {
    void loadGoldPriceTable({ forceRefresh: true });
  }

  if (isSilverSection) {
    renderInvestmentDepositOffers(false);
  }

  startMarketRefreshTimer();

  if (smoothScroll && isFundSection && ui.investmentFundSection) {
    ui.investmentFundSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (smoothScroll && isGoldSection && ui.investmentGoldSection) {
    ui.investmentGoldSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (smoothScroll && isSilverSection && ui.investmentSilverSection) {
    ui.investmentSilverSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateRouteHash(nextHash) {
  if (!nextHash || window.location.hash === nextHash) {
    return;
  }
  suppressHashRouteSync = true;
  window.location.hash = nextHash;
}

function buildCalculationHash(loanType) {
  const normalizedLoanType = String(loanType || "").trim().toLowerCase();
  return LOAN_TYPE_CONFIG[normalizedLoanType]
    ? `${CALCULATION_ROUTE_PREFIX}${normalizedLoanType}`
    : ROUTE_HASH.calculation;
}

function buildLoanRatesHash(tabKey) {
  const normalizedTabKey = String(tabKey || "").trim().toLowerCase();
  const supportedTabKeys = new Set(["need", "housing", "vehicle", "kobi"]);
  return supportedTabKeys.has(normalizedTabKey)
    ? `${LOAN_ROUTE_PREFIX}${normalizedTabKey}`
    : ROUTE_HASH.loan;
}

function buildInvestmentHash(sectionKey) {
  const normalizedSectionKey = String(sectionKey || "").trim().toLowerCase();
  const sectionHashByKey = {
    fx: ROUTE_HASH.investmentFx,
    stock: ROUTE_HASH.investmentStock,
    fund: ROUTE_HASH.investmentFund,
    gold: ROUTE_HASH.investmentGold,
    silver: ROUTE_HASH.investmentSilver,
  };
  return sectionHashByKey[normalizedSectionKey] || ROUTE_HASH.investment;
}

function shouldPrioritizeInitialRoute(hashValue) {
  const normalizedHash = String(hashValue || "").trim().toLowerCase();
  return (
    normalizedHash === ROUTE_HASH.investment ||
    normalizedHash === LEGACY_INVESTMENT_SILVER_HASH ||
    normalizedHash === LEGACY_INVESTMENT_DEPOSIT_HASH ||
    normalizedHash.startsWith(INVESTMENT_ROUTE_PREFIX)
  );
}

function getInvestmentSectionKeyFromHash(hashValue) {
  const normalizedHash = String(hashValue || "").trim().toLowerCase();
  if (!normalizedHash.startsWith(INVESTMENT_ROUTE_PREFIX)) {
    return "";
  }
  return normalizeInvestmentSectionKey(
    normalizedHash.slice(INVESTMENT_ROUTE_PREFIX.length),
  );
}

function scheduleInitialRouteSectionSync() {
  const investmentSectionKey = getInvestmentSectionKeyFromHash(window.location.hash);
  if (!investmentSectionKey) {
    return;
  }

  window.setTimeout(() => {
    revealInvestmentSection(investmentSectionKey, {
      updateHash: false,
      smoothScroll: false,
    });
  }, 120);
}

function applyRouteFromHash() {
  const rawHash = String(window.location.hash || "").trim();
  const normalizedHash = rawHash.toLowerCase();

  if (normalizedHash.startsWith(BANK_APP_REDIRECT_ROUTE_PREFIX)) {
    const queryText = rawHash.includes("?") ? rawHash.slice(rawHash.indexOf("?") + 1) : "";
    const params = new URLSearchParams(queryText);
    const bankName = params.get("bank") || currentBankProfileName || "İş Bankası";
    const productTitle = params.get("product") || "";
    renderBankAppRedirectPage(bankName, productTitle);
    return;
  }

  if (normalizedHash === ROUTE_HASH.calculation) {
    openCalculationPage({ updateHash: false });
    return;
  }

  if (normalizedHash.startsWith(CALCULATION_ROUTE_PREFIX)) {
    const calculationLoanType = normalizedHash.slice(CALCULATION_ROUTE_PREFIX.length);
    openCalculationPage({ updateHash: false });
    revealLoanCalculator(calculationLoanType, { updateHash: false, scroll: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.loan) {
    openLoanRatesPage({ updateHash: false });
    return;
  }

  if (normalizedHash.startsWith(LOAN_ROUTE_PREFIX)) {
    const loanRatesTabKey = normalizedHash.slice(LOAN_ROUTE_PREFIX.length);
    openLoanRatesPage({ updateHash: false, tabKey: loanRatesTabKey });
    return;
  }

  if (normalizedHash.startsWith(BANK_ROUTE_PREFIX)) {
    const bankName = resolveBankNameFromHash(normalizedHash);
    if (bankName) {
      openBankDetailPage({ updateHash: false, bankName });
      return;
    }
  }

  if (normalizedHash === `${BANK_ROUTE_PREFIX}is-bankasi`) {
    openBankDetailPage({ updateHash: false, bankName: "İş Bankası" });
    return;
  }

  if (normalizedHash === ROUTE_HASH.investment) {
    openInvestmentPage({ updateHash: false });
    return;
  }

  if (normalizedHash === LEGACY_INVESTMENT_SILVER_HASH) {
    openInvestmentPage({ updateHash: false, initialSectionKey: "silver" });
    return;
  }

  if (normalizedHash === LEGACY_INVESTMENT_DEPOSIT_HASH) {
    openInvestmentPage({ updateHash: false, initialSectionKey: "silver" });
    return;
  }

  if (normalizedHash.startsWith(INVESTMENT_ROUTE_PREFIX)) {
    const investmentSectionKey = normalizeInvestmentSectionKey(
      normalizedHash.slice(INVESTMENT_ROUTE_PREFIX.length),
    );
    openInvestmentPage({
      updateHash: false,
      initialSectionKey: investmentSectionKey,
    });
    return;
  }

  closeBankDetailPage({ updateHash: false });
  closeLoanRatesPage({ updateHash: false });
  closeCalculationPage({ updateHash: false });
  closeInvestmentPage({ updateHash: false });
  closeBankAppRedirectPage();
  setActiveHeaderNav("home");
}

async function loadTefasFundTable() {
  if (tefasFundTableLoaded || !ui.tefasFundBody) {
    return;
  }

  ui.tefasFundBody.replaceChildren(createEmptyRow("TEFAS verisi yükleniyor..."));
  if (ui.tefasFundMeta) {
    ui.tefasFundMeta.textContent = "Veri çekiliyor...";
  }

  try {
    const apiBase = normalizeBaseUrl(ui.apiBase ? ui.apiBase.value : "");
    const response = await fetchWithTimeout(
      `${apiBase}/api/v1/tefas/funds?limit=12`,
      {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: { Accept: "application/json" },
      },
      FETCH_TIMEOUT_MS,
    );

    if (!response.ok) {
      throw new Error(`TEFAS data fetch failed: ${response.status}`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload.funds) ? payload.funds : [];
    if (rows.length === 0) {
      throw new Error("TEFAS payload is empty");
    }

    renderTefasFundTable(
      rows,
      String(payload.source || "bilinmiyor"),
      Number(payload.fetched_at_unix || 0),
    );
    tefasFundTableLoaded = true;
  } catch (_apiError) {
    try {
      const fallbackResponse = await fetchWithTimeout(
        "../data/tefas_top12_2026-03-12.json",
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
        1500,
      );
      if (!fallbackResponse.ok) {
        throw new Error(`TEFAS fallback fetch failed: ${fallbackResponse.status}`);
      }
      const fallbackPayload = await fallbackResponse.json();
      if (!Array.isArray(fallbackPayload) || fallbackPayload.length === 0) {
        throw new Error("TEFAS fallback payload is empty");
      }
      renderTefasFundTable(fallbackPayload, "local-fallback", 0);
      tefasFundTableLoaded = true;
    } catch (error) {
      console.error(error);
      tefasFundRows = [];
      tefasFundSourceLabel = "bilinmiyor";
      tefasFundFetchedAtUnix = 0;
      ui.tefasFundBody.replaceChildren(createEmptyRow("TEFAS verisi yüklenemedi."));
      if (ui.tefasFundMeta) {
        ui.tefasFundMeta.textContent = "Veri şu an erişilemiyor";
      }
      if (ui.tefasFundSearchInfo) {
        ui.tefasFundSearchInfo.textContent = "Arama şu an kullanılamıyor.";
      }
      if (ui.tefasFundSearchClear) {
        ui.tefasFundSearchClear.disabled = true;
      }
    }
  }
}

async function loadFxPriceTable(options = {}) {
  const { forceRefresh = false, silent = false } = options;
  if (!ui.investmentFxBody) {
    return;
  }

  if (!silent) {
    renderFxPriceTable(EMBEDDED_FX_FALLBACK_PAYLOAD.rows, EMBEDDED_FX_FALLBACK_PAYLOAD);
  }

  try {
    const payload = await fetchFxPayload({ forceRefresh });
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    if (rows.length === 0) {
      throw new Error("FX payload is empty");
    }
    renderFxPriceTable(rows, payload);
  } catch (error) {
    console.error(error);
    if (!silent) {
      ui.investmentFxBody.replaceChildren(
        createEmptyRow("Döviz verisi yüklenemedi. Önce script çalıştır.", 7),
      );
      if (ui.investmentFxMeta) {
        ui.investmentFxMeta.textContent = "Kaynak dosya bulunamadı";
      }
    }
  }
}

async function fetchFxPayload(options = {}) {
  const { forceRefresh = false } = options;
  const apiBase = normalizeBaseUrl(ui.apiBase ? ui.apiBase.value : "");
  const forceRefreshQuery = forceRefresh ? "?force_refresh=true" : "";

  try {
    const apiResponse = await fetchWithTimeout(
      `${apiBase}/api/v1/market/fx${forceRefreshQuery}`,
      {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
      2500,
    );
    if (apiResponse.ok) {
      const apiPayload = await apiResponse.json();
      if (apiPayload && typeof apiPayload === "object" && Array.isArray(apiPayload.rows)) {
        return apiPayload;
      }
    }
  } catch (_error) {
    // Fall back to local snapshot files.
  }

  const dateStamp = new Date().toISOString().slice(0, 10);
  const cacheBust = forceRefresh ? `?t=${Date.now()}` : "";
  const candidateUrls = [
    `../data/doviz_kapali_carsi_latest.json${cacheBust}`,
    `../data/doviz_kapali_carsi_${dateStamp}.json${cacheBust}`,
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
        1500,
      );
      if (!response.ok) {
        continue;
      }
      const payload = await response.json();
      if (payload && typeof payload === "object" && Array.isArray(payload.rows)) {
        return payload;
      }
    } catch (_error) {
      // Try next candidate file.
    }
  }

  throw new Error("FX data file not found");
}

function renderFxPriceTable(rows, payload) {
  if (!ui.investmentFxBody) {
    return;
  }

  const allRows = rows.filter((row) => row && typeof row === "object");
  const saudiRiyalIndex = allRows.findIndex((row) => {
    const dovizAdi = String(row.doviz_adi || "").trim().toLowerCase();
    return dovizAdi === "suudi arabistan riyali";
  });
  const normalizedRows = saudiRiyalIndex >= 0
    ? allRows.slice(0, saudiRiyalIndex + 1)
    : allRows;

  if (normalizedRows.length === 0) {
    ui.investmentFxBody.replaceChildren(createEmptyRow("Döviz verisi boş görünüyor.", 7));
    return;
  }

  const fragment = document.createDocumentFragment();
  normalizedRows.forEach((row) => {
    const tr = document.createElement("tr");
    const dovizAdi = String(row.doviz_adi || "-");
    const alisFiyati = Number(row.alis_fiyati);
    const satisFiyati = Number(row.satis_fiyati);
    const degisimYuzdeRaw = row.gunluk_degisim_yuzde;
    const degisimYuzde = degisimYuzdeRaw === null || degisimYuzdeRaw === undefined
      ? Number.NaN
      : Number(degisimYuzdeRaw);
    const guncellenmeTarihi = String(row.guncellenme_tarihi || "");
    const degisimTutariRaw = row.gunluk_degisim_tutari;
    const degisimTutari = degisimTutariRaw === null || degisimTutariRaw === undefined
      ? estimateGoldChangeAmount(satisFiyati, degisimYuzde)
      : Number(degisimTutariRaw);
    const resolvedDegisimTutari = Number.isFinite(degisimTutari)
      ? degisimTutari
      : estimateGoldChangeAmount(satisFiyati, degisimYuzde);
    const isUp = Number.isFinite(degisimYuzde) && degisimYuzde >= 0;

    appendCell(tr, dovizAdi);
    appendCell(tr, formatGoldNumber(alisFiyati));
    appendCell(tr, formatGoldNumber(satisFiyati));
    appendCell(tr, formatGoldTime(guncellenmeTarihi));

    const trendCell = document.createElement("td");
    const trendSpan = document.createElement("span");
    trendSpan.className = isUp ? "table-trend-up" : "table-trend-down";
    trendSpan.textContent = isUp ? "↑" : "↓";
    trendCell.append(trendSpan);
    tr.append(trendCell);

    const amountCell = document.createElement("td");
    const amountSpan = document.createElement("span");
    amountSpan.className = isUp ? "table-change-up" : "table-change-down";
    amountSpan.textContent = formatGoldAmount(resolvedDegisimTutari);
    amountCell.append(amountSpan);
    tr.append(amountCell);

    const percentCell = document.createElement("td");
    const percentSpan = document.createElement("span");
    percentSpan.className = isUp ? "table-change-up" : "table-change-down";
    percentSpan.textContent = formatGoldPercent(degisimYuzde);
    percentCell.append(percentSpan);
    tr.append(percentCell);

    fragment.append(tr);
  });
  ui.investmentFxBody.replaceChildren(fragment);

  if (ui.investmentFxMeta) {
    const sourceLabel = String(payload.kaynak || "Kapalı Çarşı");
    ui.investmentFxMeta.textContent = `Kaynak: ${sourceLabel}, ${formatCurrentDate()}`;
  }
}

async function loadGoldPriceTable(options = {}) {
  const { forceRefresh = false, silent = false } = options;
  if (!ui.investmentGoldBody) {
    return;
  }

  if (!silent) {
    renderGoldPriceTable(
      EMBEDDED_GOLD_FALLBACK_PAYLOAD.rows,
      EMBEDDED_GOLD_FALLBACK_PAYLOAD,
    );
  }

  try {
    const payload = await fetchGoldPayload({ forceRefresh });
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    if (rows.length === 0) {
      throw new Error("Gold payload is empty");
    }
    renderGoldPriceTable(rows, payload);
  } catch (error) {
    console.error(error);
    if (!silent) {
      ui.investmentGoldBody.replaceChildren(
        createEmptyRow("Altın verisi yüklenemedi. Önce script çalıştır.", 7),
      );
      if (ui.investmentGoldMeta) {
        ui.investmentGoldMeta.textContent = "Kaynak dosya bulunamadı";
      }
    }
  }
}

async function fetchGoldPayload(options = {}) {
  const { forceRefresh = false } = options;
  const apiBase = normalizeBaseUrl(ui.apiBase ? ui.apiBase.value : "");
  const forceRefreshQuery = forceRefresh ? "?force_refresh=true" : "";
  const localFallbackPayload = await loadLocalGoldPayload({ forceRefresh });

  try {
    const apiResponse = await fetchWithTimeout(
      `${apiBase}/api/v1/market/gold${forceRefreshQuery}`,
      {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
      2500,
    );
    if (apiResponse.ok) {
      const apiPayload = await apiResponse.json();
      if (apiPayload && typeof apiPayload === "object" && Array.isArray(apiPayload.rows)) {
        return mergeGoldPayloadWithFallback(apiPayload, localFallbackPayload);
      }
    }
  } catch (_error) {
    // Fall back to local snapshot files.
  }

  if (localFallbackPayload) {
    return localFallbackPayload;
  }

  throw new Error("Gold data file not found");
}

async function loadLocalGoldPayload(options = {}) {
  const { forceRefresh = false } = options;
  const dateStamp = new Date().toISOString().slice(0, 10);
  const cacheBust = forceRefresh ? `?t=${Date.now()}` : "";
  const candidateUrls = [
    `../data/altin_kapali_carsi_latest.json${cacheBust}`,
    `../data/altin_kapali_carsi_${dateStamp}.json${cacheBust}`,
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
        1500,
      );
      if (!response.ok) {
        continue;
      }
      const payload = await response.json();
      if (payload && typeof payload === "object" && Array.isArray(payload.rows)) {
        return payload;
      }
    } catch (_error) {
      // Try next candidate file.
    }
  }

  return null;
}

function mergeGoldPayloadWithFallback(apiPayload, fallbackPayload) {
  if (!fallbackPayload || !Array.isArray(fallbackPayload.rows)) {
    return apiPayload;
  }

  const apiRows = Array.isArray(apiPayload.rows) ? apiPayload.rows : [];
  const fallbackRows = fallbackPayload.rows;
  const rowByName = new Map();

  apiRows.forEach((row) => {
    const rowName = normalizeGoldRowName(row?.altin_adi);
    if (rowName) {
      rowByName.set(rowName, row);
    }
  });

  fallbackRows.forEach((row) => {
    const rowName = normalizeGoldRowName(row?.altin_adi);
    if (!rowName || rowByName.has(rowName)) {
      return;
    }
    rowByName.set(rowName, row);
  });

  return {
    ...apiPayload,
    count: rowByName.size,
    rows: Array.from(rowByName.values()),
  };
}

function normalizeGoldRowName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü]+/gi, " ")
    .trim();
}

function prepareGoldRows(rows) {
  const hiddenNameKeys = new Set([
    "ata altın",
    "14 ayar bilezik",
    "18 ayar bilezik",
    "22 ayar bilezik",
    "gram altın serb",
  ]);
  const orderMap = new Map([
    ["gram altın", 0],
    ["çeyrek altın", 1],
    ["yarım altın", 2],
    ["cumhuriyet altını", 3],
    ["altın ons usd", 4],
  ]);

  return rows
    .filter((row) => row && typeof row === "object")
    .filter((row) => !hiddenNameKeys.has(normalizeGoldRowName(row.altin_adi)))
    .sort((leftRow, rightRow) => {
      const leftName = String(leftRow.altin_adi || "");
      const rightName = String(rightRow.altin_adi || "");
      const leftOrder = orderMap.get(normalizeGoldRowName(leftName)) ?? orderMap.size;
      const rightOrder = orderMap.get(normalizeGoldRowName(rightName)) ?? orderMap.size;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return leftName.localeCompare(rightName, "tr");
    });
}

function renderGoldPriceTable(rows, payload) {
  if (!ui.investmentGoldBody) {
    return;
  }

  let normalizedRows = [];
  try {
    normalizedRows = prepareGoldRows(rows);
  } catch (error) {
    console.error("Gold row preparation failed", error);
    normalizedRows = Array.isArray(rows)
      ? rows.filter((row) => row && typeof row === "object")
      : [];
  }
  if (normalizedRows.length === 0) {
    ui.investmentGoldBody.replaceChildren(createEmptyRow("Altın verisi boş görünüyor.", 7));
    return;
  }

  const fragment = document.createDocumentFragment();
  normalizedRows.forEach((row) => {
    const tr = document.createElement("tr");
    const altinAdi = String(row.altin_adi || "-");
    const alisFiyati = Number(row.alis_fiyati);
    const satisFiyati = Number(row.satis_fiyati);
    const degisimYuzde = Number(row.gunluk_degisim_yuzde);
    const guncellenmeTarihi = String(row.guncellenme_tarihi || "");
    const degisimTutari = estimateGoldChangeAmount(satisFiyati, degisimYuzde);
    const isUp = Number.isFinite(degisimYuzde) && degisimYuzde >= 0;

    appendCell(tr, altinAdi);
    appendCell(tr, formatGoldNumber(alisFiyati));
    appendCell(tr, formatGoldNumber(satisFiyati));
    appendCell(tr, formatGoldTime(guncellenmeTarihi));

    const trendCell = document.createElement("td");
    const trendSpan = document.createElement("span");
    trendSpan.className = isUp ? "table-trend-up" : "table-trend-down";
    trendSpan.textContent = isUp ? "↑" : "↓";
    trendCell.append(trendSpan);
    tr.append(trendCell);

    const amountCell = document.createElement("td");
    const amountSpan = document.createElement("span");
    amountSpan.className = isUp ? "table-change-up" : "table-change-down";
    amountSpan.textContent = formatGoldAmount(degisimTutari);
    amountCell.append(amountSpan);
    tr.append(amountCell);

    const percentCell = document.createElement("td");
    const percentSpan = document.createElement("span");
    percentSpan.className = isUp ? "table-change-up" : "table-change-down";
    percentSpan.textContent = formatGoldPercent(degisimYuzde);
    percentCell.append(percentSpan);
    tr.append(percentCell);

    fragment.append(tr);
  });
  ui.investmentGoldBody.replaceChildren(fragment);

  if (ui.investmentGoldMeta) {
    const sourceLabel = String(payload.kaynak || "Kapalı Çarşı");
    ui.investmentGoldMeta.textContent = `Kaynak: ${sourceLabel}, ${formatCurrentDate()}`;
  }
}

async function loadSilverPriceTable(options = {}) {
  const { forceRefresh = false, silent = false } = options;
  if (!ui.investmentSilverBody) {
    return;
  }

  if (!silent) {
    ui.investmentSilverBody.replaceChildren(createEmptyRow("Gümüş verisi yükleniyor...", 7));
  }
  if (!silent && ui.investmentSilverMeta) {
    ui.investmentSilverMeta.textContent = "Kaynak: Kapalıçarşı";
  }

  try {
    const payload = await fetchSilverPayload({ forceRefresh });
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    renderSilverPriceTable(rows, payload);
  } catch (error) {
    console.error(error);
    if (!silent) {
      ui.investmentSilverBody.replaceChildren(
        createEmptyRow("Gümüş verisi yüklenemedi. Önce script çalıştır.", 7),
      );
      if (ui.investmentSilverMeta) {
        ui.investmentSilverMeta.textContent = "Kaynak dosya bulunamadı";
      }
    }
  }
}

async function fetchSilverPayload(options = {}) {
  const { forceRefresh = false } = options;
  const dateStamp = new Date().toISOString().slice(0, 10);
  const cacheBust = forceRefresh ? `?t=${Date.now()}` : "";
  const candidateUrls = [
    `../data/gumus_kapali_carsi_latest.json${cacheBust}`,
    `../data/gumus_kapali_carsi_${dateStamp}.json${cacheBust}`,
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
        1500,
      );
      if (!response.ok) {
        continue;
      }
      const payload = await response.json();
      if (payload && typeof payload === "object" && Array.isArray(payload.rows)) {
        return payload;
      }
    } catch (_error) {
      // Try next candidate file.
    }
  }

  throw new Error("Silver data file not found");
}

function renderSilverPriceTable(rows, payload) {
  if (!ui.investmentSilverBody) {
    return;
  }

  const normalizedRows = rows.filter((row) => row && typeof row === "object");
  if (normalizedRows.length === 0) {
    ui.investmentSilverBody.replaceChildren(
      createEmptyRow("Kapalı Çarşı kaynağında gümüş satırı bulunamadı.", 7),
    );
    if (ui.investmentSilverMeta) {
      const sourceLabel = String(payload.kaynak || "Kapalı Çarşı");
      ui.investmentSilverMeta.textContent = `Kaynak: ${sourceLabel}`;
    }
    return;
  }

  const fragment = document.createDocumentFragment();
  normalizedRows.forEach((row) => {
    const tr = document.createElement("tr");
    const gumusAdi = String(row.gumus_adi || "-");
    const alisFiyati = Number(row.alis_fiyati);
    const satisFiyati = Number(row.satis_fiyati);
    const degisimYuzdeRaw = row.gunluk_degisim_yuzde;
    const degisimYuzde = degisimYuzdeRaw === null || degisimYuzdeRaw === undefined
      ? Number.NaN
      : Number(degisimYuzdeRaw);
    const guncellenmeTarihi = String(row.guncellenme_tarihi || "");
    const degisimTutariRaw = row.gunluk_degisim_tutari;
    const degisimTutari = degisimTutariRaw === null || degisimTutariRaw === undefined
      ? estimateGoldChangeAmount(satisFiyati, degisimYuzde)
      : Number(degisimTutariRaw);
    const resolvedDegisimTutari = Number.isFinite(degisimTutari)
      ? degisimTutari
      : estimateGoldChangeAmount(satisFiyati, degisimYuzde);
    const isUp = Number.isFinite(degisimYuzde) && degisimYuzde >= 0;

    appendCell(tr, gumusAdi);
    appendCell(tr, formatGoldNumber(alisFiyati));
    appendCell(tr, formatGoldNumber(satisFiyati));
    appendCell(tr, formatGoldTime(guncellenmeTarihi));

    const trendCell = document.createElement("td");
    const trendSpan = document.createElement("span");
    trendSpan.className = isUp ? "table-trend-up" : "table-trend-down";
    trendSpan.textContent = isUp ? "↑" : "↓";
    trendCell.append(trendSpan);
    tr.append(trendCell);

    const amountCell = document.createElement("td");
    const amountSpan = document.createElement("span");
    amountSpan.className = isUp ? "table-change-up" : "table-change-down";
    amountSpan.textContent = formatGoldAmount(resolvedDegisimTutari);
    amountCell.append(amountSpan);
    tr.append(amountCell);

    const percentCell = document.createElement("td");
    const percentSpan = document.createElement("span");
    percentSpan.className = isUp ? "table-change-up" : "table-change-down";
    percentSpan.textContent = formatGoldPercent(degisimYuzde);
    percentCell.append(percentSpan);
    tr.append(percentCell);

    fragment.append(tr);
  });
  ui.investmentSilverBody.replaceChildren(fragment);

  if (ui.investmentSilverMeta) {
    const sourceLabel = String(payload.kaynak || "Kapalı Çarşı");
    ui.investmentSilverMeta.textContent = `Kaynak: ${sourceLabel}`;
  }
}

function startMarketRefreshTimer() {
  stopMarketRefreshTimer();

  if (!["fx", "gold"].includes(currentInvestmentSectionKey)) {
    return;
  }

  marketRefreshTimerId = window.setInterval(() => {
    if (document.hidden) {
      return;
    }

    if (currentInvestmentSectionKey === "fx") {
      void loadFxPriceTable({ forceRefresh: true, silent: true });
      return;
    }

    if (currentInvestmentSectionKey === "gold") {
      void loadGoldPriceTable({ forceRefresh: true, silent: true });
      return;
    }

  }, MARKET_REFRESH_INTERVAL_MS);
}

function stopMarketRefreshTimer() {
  if (marketRefreshTimerId === null) {
    return;
  }

  window.clearInterval(marketRefreshTimerId);
  marketRefreshTimerId = null;
}

function renderTefasFundTable(rows, sourceLabel = "bilinmiyor", fetchedAtUnix = 0) {
  tefasFundRows = Array.isArray(rows) ? rows.filter((row) => row && typeof row === "object") : [];
  tefasFundSourceLabel = sourceLabel;
  tefasFundFetchedAtUnix = fetchedAtUnix;
  applyTefasFundFilter();
}

function applyTefasFundFilter() {
  if (!ui.tefasFundBody) {
    return;
  }

  const queryText = String(ui.tefasFundSearchInput ? ui.tefasFundSearchInput.value : "").trim();
  const normalizedQuery = normalizeTefasSearchText(queryText);

  const filteredRows = tefasFundRows.filter((row) => {
    if (!normalizedQuery) {
      return true;
    }

    const fundCode = normalizeTefasSearchText(row.fon_kodu);
    const fundName = normalizeTefasSearchText(row.fon_unvani);
    return fundCode.includes(normalizedQuery) || fundName.includes(normalizedQuery);
  });

  renderTefasFundRows(filteredRows, queryText);
}

function renderTefasFundRows(rows, queryText = "") {
  if (!ui.tefasFundBody) {
    return;
  }

  const hasSearchQuery = queryText.length > 0;
  if (rows.length === 0) {
    ui.tefasFundBody.replaceChildren(
      createEmptyRow(
        hasSearchQuery ? "Aramana uygun fon bulunamadı." : "TEFAS verisi şu an boş görünüyor.",
      ),
    );
  } else {
    const fragment = document.createDocumentFragment();
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      appendCell(tr, String(row.fon_kodu || "-"));
      appendCell(tr, String(row.fon_unvani || "-"), "tefas-cell-left");
      appendCell(tr, formatTefasNumber(row.fiyat, 6), "tefas-cell-right");
      appendCell(tr, formatTefasNumber(row.portfoy_buyuklugu, 0), "tefas-cell-right");
      appendCell(tr, formatTefasReturn(row.bir_aylik_getiri));
      appendCell(tr, formatTefasReturn(row.bir_yillik_getiri));
      fragment.append(tr);
    });
    ui.tefasFundBody.replaceChildren(fragment);
  }

  const totalCount = tefasFundRows.length;
  const visibleCount = rows.length;
  const firstRow = rows[0] || tefasFundRows[0];
  const referenceDate = tefasFundFetchedAtUnix > 0
    ? formatTefasUnixDate(tefasFundFetchedAtUnix)
    : formatTefasDate(firstRow?.tarih_ms);

  if (ui.tefasFundMeta) {
    ui.tefasFundMeta.textContent = `Güncelleme: ${referenceDate}`;
  }

  if (ui.tefasFundSearchInfo) {
    if (hasSearchQuery) {
      ui.tefasFundSearchInfo.textContent = `"${queryText}" için ${visibleCount} fon bulundu.`;
    } else {
      ui.tefasFundSearchInfo.textContent = "";
    }
  }

  if (ui.tefasFundSearchClear) {
    ui.tefasFundSearchClear.disabled = !hasSearchQuery;
  }
}

function normalizeTefasSearchText(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function appendCell(rowElement, textContent, className = "") {
  const td = document.createElement("td");
  td.textContent = textContent;
  if (className) {
    td.className = className;
  }
  rowElement.append(td);
}

function createEmptyRow(message, colSpan = 6) {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = colSpan;
  td.className = "table-empty";
  td.textContent = message;
  tr.append(td);
  return tr;
}

function formatGoldNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatGoldPercent(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(numericValue));
  const sign = numericValue >= 0 ? "+" : "-";
  return `${sign}%${formatted}`;
}

function formatGoldAmount(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(numericValue));
  const sign = numericValue >= 0 ? "+" : "-";
  return `${sign}${formatted}`;
}

function formatGoldTime(isoText) {
  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatGoldDateTime(isoText) {
  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function estimateGoldChangeAmount(sellingValue, dailyPercent) {
  const selling = Number(sellingValue);
  const percent = Number(dailyPercent);
  if (!Number.isFinite(selling) || !Number.isFinite(percent)) {
    return Number.NaN;
  }
  const base = 1 + (percent / 100);
  if (!Number.isFinite(base) || base === 0) {
    return Number.NaN;
  }
  const previousValue = selling / base;
  return selling - previousValue;
}

function formatTefasNumber(value, fractionDigits) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numericValue);
}

function formatTefasReturn(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);

  return `${formatted}%`;
}

function formatTefasDate(rawTimestamp) {
  const timestamp = Number(rawTimestamp);
  if (!Number.isFinite(timestamp)) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
}

function formatTefasUnixDate(rawTimestampSeconds) {
  const timestampSeconds = Number(rawTimestampSeconds);
  if (!Number.isFinite(timestampSeconds) || timestampSeconds <= 0) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestampSeconds * 1000));
}

function syncSubpageBodyClasses() {
  const bankDetailOpen = Boolean(ui.bankDetailPage && !ui.bankDetailPage.classList.contains("hidden"));
  const loanRatesOpen = Boolean(ui.loanRatesPage && !ui.loanRatesPage.classList.contains("hidden"));
  const calculationOpen = Boolean(ui.calculationPage && !ui.calculationPage.classList.contains("hidden"));
  const investmentOpen = Boolean(ui.investmentPage && !ui.investmentPage.classList.contains("hidden"));
  const bankRedirectOpen = Boolean(ui.bankAppRedirectPage && !ui.bankAppRedirectPage.classList.contains("hidden"));
  document.body.classList.toggle("loan-rates-open", loanRatesOpen);
  document.body.classList.toggle(
    "subpage-open",
    bankDetailOpen || loanRatesOpen || calculationOpen || investmentOpen || bankRedirectOpen,
  );
}

function scrollHomeSectionIntoView() {
  const homeTopTarget = document.getElementById("planlama-akisi");
  if (!homeTopTarget) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const headerElement = document.querySelector(".site-header");
  const headerHeight = headerElement instanceof HTMLElement ? headerElement.getBoundingClientRect().height : 0;
  const targetTop = window.scrollY + homeTopTarget.getBoundingClientRect().top - headerHeight - 8;
  window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
}

function scrollElementBelowHeader(targetElement, behavior = "smooth") {
  if (!(targetElement instanceof HTMLElement)) {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const headerElement = document.querySelector(".site-header");
  const headerHeight = headerElement instanceof HTMLElement ? headerElement.getBoundingClientRect().height : 0;
  const targetTop = window.scrollY + targetElement.getBoundingClientRect().top - headerHeight - 8;
  window.scrollTo({ top: Math.max(targetTop, 0), behavior });
}

function setNeedCalculatorTab(tabKey) {
  const selectedTab = tabKey === "installment" ? "installment" : "principal";
  const isPrincipal = selectedTab === "principal";

  if (ui.needCalcPanePrincipal) {
    ui.needCalcPanePrincipal.classList.toggle("hidden", !isPrincipal);
  }
  if (ui.needCalcPaneInstallment) {
    ui.needCalcPaneInstallment.classList.toggle("hidden", isPrincipal);
  }

  if (ui.needCalcTabPrincipal) {
    ui.needCalcTabPrincipal.classList.toggle("active", isPrincipal);
    ui.needCalcTabPrincipal.setAttribute("aria-selected", isPrincipal ? "true" : "false");
  }
  if (ui.needCalcTabInstallment) {
    ui.needCalcTabInstallment.classList.toggle("active", !isPrincipal);
    ui.needCalcTabInstallment.setAttribute("aria-selected", !isPrincipal ? "true" : "false");
  }

  if (isPrincipal && ui.needCalcResult && !ui.needCalcResult.classList.contains("hidden")) {
    return;
  }
}

function clearNeedCalcFieldError(fieldElement) {
  if (!(fieldElement instanceof HTMLElement)) {
    return;
  }
  const fieldWrapper = fieldElement.closest(".need-calc-field");
  if (!(fieldWrapper instanceof HTMLElement)) {
    return;
  }
  fieldWrapper.classList.remove("has-error");
  const errorElement = fieldWrapper.querySelector(".need-calc-field-error");
  if (errorElement instanceof HTMLElement) {
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
  }
}

function setNeedCalcFieldError(fieldElement, message) {
  if (!(fieldElement instanceof HTMLElement)) {
    return;
  }
  const fieldWrapper = fieldElement.closest(".need-calc-field");
  if (!(fieldWrapper instanceof HTMLElement)) {
    return;
  }
  fieldWrapper.classList.add("has-error");
  const errorElement = fieldWrapper.querySelector(".need-calc-field-error");
  if (errorElement instanceof HTMLElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}

function clearNeedCalcFormErrors(formElement) {
  if (!(formElement instanceof HTMLFormElement)) {
    return;
  }
  formElement.querySelectorAll(".need-calc-field input, .need-calc-field select").forEach((fieldElement) => {
    if (fieldElement instanceof HTMLElement) {
      clearNeedCalcFieldError(fieldElement);
    }
  });
}

function setupNeedLoanCalculator() {
  if (
    !ui.needCalcForm &&
    !ui.needInstallmentForm &&
    !ui.depositCalcForm &&
    !ui.compoundCalcForm &&
    !ui.realCalcForm
  ) {
    return;
  }

  if (ui.needCalcTabPrincipal) {
    ui.needCalcTabPrincipal.addEventListener("click", () => {
      setNeedCalculatorTab("principal");
    });
  }
  if (ui.needCalcTabInstallment) {
    ui.needCalcTabInstallment.addEventListener("click", () => {
      setNeedCalculatorTab("installment");
    });
  }
  setNeedCalculatorTab("principal");

  [
    ui.needPrincipal,
    ui.needRate,
    ui.needInstallmentAmount,
    ui.needInstallmentRateInput,
    ui.depositPrincipal,
    ui.investmentDepositPrincipal,
    ui.compoundPrincipal,
    ui.realInitialAmount,
    ui.realFinalAmount,
  ].forEach((inputElement) => {
    if (!inputElement) {
      return;
    }

    inputElement.value = formatAmountInput(inputElement.value);
    inputElement.addEventListener("input", () => {
      inputElement.value = formatAmountInput(inputElement.value);
      clearNeedCalcFieldError(inputElement);
    });
  });

  [
    ui.needRate,
    ui.needInstallmentRateInput,
    ui.needTerm,
    ui.needInstallmentTerm,
  ].forEach((fieldElement) => {
    if (!fieldElement) {
      return;
    }
    fieldElement.addEventListener("input", () => {
      clearNeedCalcFieldError(fieldElement);
    });
    fieldElement.addEventListener("change", () => {
      clearNeedCalcFieldError(fieldElement);
    });
  });

  if (ui.needCalcForm) {
    ui.needCalcForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderNeedLoanTable();
    });
  }

  if (ui.needInstallmentForm) {
    ui.needInstallmentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderNeedLoanByInstallment();
    });
  }

  if (ui.depositCalcForm) {
    ui.depositCalcForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderDepositCalculator();
    });
  }

  if (ui.investmentDepositForm) {
    ui.investmentDepositForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderInvestmentDepositOffers(true);
    });
  }

  [ui.investmentDepositAccountTypeFilter, ui.investmentDepositBankTypeFilter].forEach((filterElement) => {
    if (!filterElement) {
      return;
    }
    filterElement.addEventListener("change", () => {
      renderInvestmentDepositOffers(false);
    });
  });

  if (ui.compoundCalcForm) {
    ui.compoundCalcForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderCompoundCalculator();
    });
  }

  if (ui.realCalcForm) {
    ui.realCalcForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderRealCalculator();
    });
  }
}

function revealLoanCalculator(loanType, options = {}) {
  if (!ui.needLoanCalculator && !ui.depositCalculator && !ui.compoundCalculator && !ui.realCalculator) {
    return;
  }
  const { updateHash = true, scroll = true } = options;

  const resolvedLoanType = LOAN_TYPE_CONFIG[loanType] ? loanType : "need";
  if (ui.calculationPage) {
    ui.calculationPage.dataset.loanType = resolvedLoanType;
  }
  if (updateHash && ui.calculationPage && !ui.calculationPage.classList.contains("hidden")) {
    updateRouteHash(buildCalculationHash(resolvedLoanType));
  }

  const typeConfig = LOAN_TYPE_CONFIG[resolvedLoanType] || LOAN_TYPE_CONFIG.need;
  document.querySelectorAll(".calculation-card").forEach((cardElement) => {
    cardElement.classList.remove("is-active");
  });
  const activeCardByType = {
    need: ui.calcNeedLoanCard,
    housing: ui.calcHousingLoanCard,
    vehicle: ui.calcVehicleLoanCard,
    deposit: ui.calcDepositCard,
    compound: ui.calcCompoundCard,
    real: ui.calcRealCard,
  };
  const activeCard = activeCardByType[resolvedLoanType] || ui.calcNeedLoanCard;
  if (activeCard) {
    activeCard.classList.add("is-active");
  }

  if (resolvedLoanType === "deposit") {
    if (ui.needCalcScheduleSection) {
      ui.needCalcScheduleSection.classList.add("hidden");
    }
    if (ui.needLoanCalculatorTitle) {
      ui.needLoanCalculatorTitle.classList.add("hidden");
    }
    if (ui.depositCalculatorTitle) {
      ui.depositCalculatorTitle.classList.remove("hidden");
    }
    if (ui.compoundCalculatorTitle) {
      ui.compoundCalculatorTitle.classList.add("hidden");
    }
    if (ui.realCalculatorTitle) {
      ui.realCalculatorTitle.classList.add("hidden");
    }
    if (ui.needLoanCalculator) {
      ui.needLoanCalculator.classList.add("hidden");
    }
    if (ui.compoundCalculator) {
      ui.compoundCalculator.classList.add("hidden");
    }
    if (ui.realCalculator) {
      ui.realCalculator.classList.add("hidden");
    }
    if (ui.loanOffersPanel) {
      ui.loanOffersPanel.classList.add("hidden");
    }

    if (ui.depositCalculator) {
      applyDepositDefaults();
      ui.depositCalculator.classList.remove("hidden");
      if (scroll) {
        scrollElementBelowHeader(ui.depositCalculatorTitle || ui.depositCalculator);
      }
    }
    return;
  }

  if (resolvedLoanType === "compound") {
    if (ui.needCalcScheduleSection) {
      ui.needCalcScheduleSection.classList.add("hidden");
    }
    if (ui.needLoanCalculatorTitle) {
      ui.needLoanCalculatorTitle.classList.add("hidden");
    }
    if (ui.depositCalculatorTitle) {
      ui.depositCalculatorTitle.classList.add("hidden");
    }
    if (ui.compoundCalculatorTitle) {
      ui.compoundCalculatorTitle.classList.remove("hidden");
    }
    if (ui.realCalculatorTitle) {
      ui.realCalculatorTitle.classList.add("hidden");
    }
    if (ui.needLoanCalculator) {
      ui.needLoanCalculator.classList.add("hidden");
    }
    if (ui.depositCalculator) {
      ui.depositCalculator.classList.add("hidden");
    }
    if (ui.realCalculator) {
      ui.realCalculator.classList.add("hidden");
    }
    if (ui.loanOffersPanel) {
      ui.loanOffersPanel.classList.add("hidden");
    }

    if (ui.compoundCalculator) {
      applyCompoundDefaults();
      ui.compoundCalculator.classList.remove("hidden");
      if (scroll) {
        scrollElementBelowHeader(ui.compoundCalculatorTitle || ui.compoundCalculator);
      }
    }
    return;
  }

  if (resolvedLoanType === "real") {
    if (ui.needCalcScheduleSection) {
      ui.needCalcScheduleSection.classList.add("hidden");
    }
    if (ui.needLoanCalculatorTitle) {
      ui.needLoanCalculatorTitle.classList.add("hidden");
    }
    if (ui.depositCalculatorTitle) {
      ui.depositCalculatorTitle.classList.add("hidden");
    }
    if (ui.compoundCalculatorTitle) {
      ui.compoundCalculatorTitle.classList.add("hidden");
    }
    if (ui.realCalculatorTitle) {
      ui.realCalculatorTitle.classList.remove("hidden");
    }
    if (ui.needLoanCalculator) {
      ui.needLoanCalculator.classList.add("hidden");
    }
    if (ui.depositCalculator) {
      ui.depositCalculator.classList.add("hidden");
    }
    if (ui.compoundCalculator) {
      ui.compoundCalculator.classList.add("hidden");
    }
    if (ui.loanOffersPanel) {
      ui.loanOffersPanel.classList.add("hidden");
    }

    if (ui.realCalculator) {
      applyRealDefaults();
      ui.realCalculator.classList.remove("hidden");
      if (scroll) {
        scrollElementBelowHeader(ui.realCalculatorTitle || ui.realCalculator);
      }
    }
    return;
  }

  if (ui.depositCalculator) {
    ui.depositCalculator.classList.add("hidden");
  }
  if (ui.compoundCalculator) {
    ui.compoundCalculator.classList.add("hidden");
  }
  if (ui.realCalculator) {
    ui.realCalculator.classList.add("hidden");
  }
  if (ui.needCalcScheduleSection) {
    ui.needCalcScheduleSection.classList.add("hidden");
  }

  applyLoanTypeDefaults(typeConfig);
  if (ui.needLoanCalculatorTitle) {
    ui.needLoanCalculatorTitle.textContent = `${typeConfig.title} Hesaplama`;
    ui.needLoanCalculatorTitle.classList.remove("hidden");
  }
  if (ui.depositCalculatorTitle) {
    ui.depositCalculatorTitle.classList.add("hidden");
  }
  if (ui.compoundCalculatorTitle) {
    ui.compoundCalculatorTitle.classList.add("hidden");
  }
  if (ui.realCalculatorTitle) {
    ui.realCalculatorTitle.classList.add("hidden");
  }
  ui.needLoanCalculator.classList.remove("hidden");
  renderNeedLoanTable(false);
  renderNeedLoanByInstallment(false);
  if (scroll) {
    scrollElementBelowHeader(ui.needLoanCalculatorTitle || ui.needLoanCalculator);
  }
}

function applyLoanTypeDefaults(typeConfig) {
  if (!typeConfig) {
    return;
  }

  if (ui.needPrincipal) {
    ui.needPrincipal.value = "";
  }
  if (ui.needInstallmentAmount) {
    ui.needInstallmentAmount.value = "";
  }
  if (ui.needRate) {
    ui.needRate.value = "";
  }
  if (ui.needInstallmentRateInput) {
    ui.needInstallmentRateInput.value = "";
  }

  populateTermOptions(ui.needTerm, typeConfig.terms, typeConfig.defaultTerm);
  populateTermOptions(ui.needInstallmentTerm, typeConfig.terms, typeConfig.defaultTerm);

  if (ui.needCalcResult) {
    ui.needCalcResult.classList.add("hidden");
  }
  if (ui.needInstallmentResult) {
    ui.needInstallmentResult.classList.add("hidden");
  }
  if (ui.loanOffersPanel) {
    ui.loanOffersPanel.classList.add("hidden");
  }
}

function applyDepositDefaults() {
  if (ui.depositPrincipal) {
    ui.depositPrincipal.value = "";
  }
  if (ui.depositRate) {
    ui.depositRate.value = "";
  }
  if (ui.depositCalcResult) {
    ui.depositCalcResult.classList.add("hidden");
  }
}

function applyCompoundDefaults() {
  if (ui.compoundPrincipal) {
    ui.compoundPrincipal.value = "";
  }
  if (ui.compoundRate) {
    ui.compoundRate.value = "";
  }
  if (ui.compoundTerm) {
    ui.compoundTerm.value = "";
  }
  if (ui.compoundTermUnit && !ui.compoundTermUnit.value) {
    ui.compoundTermUnit.value = "day";
  }
  if (ui.compoundCalcResult) {
    ui.compoundCalcResult.classList.add("hidden");
  }
}

function applyRealDefaults() {
  if (ui.realInitialAmount) {
    ui.realInitialAmount.value = "";
  }
  if (ui.realFinalAmount) {
    ui.realFinalAmount.value = "";
  }
  if (ui.realInflationRate) {
    ui.realInflationRate.value = "";
  }
  if (ui.realBuyDate) {
    ui.realBuyDate.value = "";
  }
  if (ui.realSellDate) {
    ui.realSellDate.value = "";
  }
  if (ui.realCalcResult) {
    ui.realCalcResult.classList.add("hidden");
  }
}

function populateTermOptions(selectElement, terms, selectedTerm) {
  if (!selectElement || !Array.isArray(terms) || terms.length === 0) {
    return;
  }

  const optionsMarkup = terms
    .map((term) => {
      const value = Number(term);
      return `<option value="${value}">${value} Ay</option>`;
    })
    .join("");
  selectElement.innerHTML = optionsMarkup;

  const fallbackTerm = String(terms[0]);
  selectElement.value = String(selectedTerm);
  if (selectElement.value !== String(selectedTerm)) {
    selectElement.value = fallbackTerm;
  }
}

function renderNeedLoanTable(updateOffers = true) {
  if (
    !ui.needPrincipal ||
    !ui.needTerm ||
    !ui.needRate ||
    !ui.needCalcResult ||
    !ui.needCalcMonthly ||
    !ui.needCalcTotal ||
    !ui.needCalcInterest
  ) {
    return;
  }

  const principal = parseAmountInput(ui.needPrincipal.value);
  const termMonths = Number.parseInt(ui.needTerm.value, 10);
  const monthlyRate = Number.parseFloat(ui.needRate.value);
  const effectiveMonthlyRate = getEffectiveLoanMonthlyRate(monthlyRate, getCurrentLoanType());
  let hasError = false;

  clearNeedCalcFormErrors(ui.needCalcForm);

  if (!Number.isFinite(principal) || principal <= 0) {
    setNeedCalcFieldError(ui.needPrincipal, "Kredi tutarı gir.");
    hasError = true;
  }
  if (!Number.isFinite(termMonths) || termMonths <= 0) {
    setNeedCalcFieldError(ui.needTerm, "Vade seç.");
    hasError = true;
  }
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0) {
    setNeedCalcFieldError(ui.needRate, "Faiz oranı gir.");
    hasError = true;
  }

  if (hasError) {
    ui.needCalcResult.classList.add("hidden");
    if (ui.needCalcScheduleSection) {
      ui.needCalcScheduleSection.classList.add("hidden");
    }
    return;
  }

  const monthlyPayment = calculateInstallment(principal, effectiveMonthlyRate, termMonths);
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;

  ui.needCalcMonthly.textContent = formatTryWithCents(monthlyPayment);
  ui.needCalcTotal.textContent = formatTry(totalPayment);
  ui.needCalcInterest.textContent = formatTry(totalInterest);
  if (ui.needCalcNote) {
    ui.needCalcNote.textContent = buildLoanTaxNote(getCurrentLoanType());
  }
  renderLoanPaymentSchedule({
    tbodyElement: ui.needCalcScheduleBody,
    principal,
    nominalMonthlyRatePercent: monthlyRate,
    loanType: getCurrentLoanType(),
    termMonths,
  });
  if (ui.needCalcScheduleTitle) {
    ui.needCalcScheduleTitle.textContent = "Ödeme Planı";
  }
  if (ui.needCalcScheduleSection) {
    ui.needCalcScheduleSection.classList.remove("hidden");
  }
  ui.needCalcResult.classList.remove("hidden");
}

function renderNeedLoanByInstallment(updateOffers = true) {
  if (
    !ui.needInstallmentAmount ||
    !ui.needInstallmentTerm ||
    !ui.needInstallmentRateInput ||
    !ui.needInstallmentResult ||
    !ui.needInstallmentPrincipal ||
    !ui.needInstallmentTotal ||
    !ui.needInstallmentInterest
  ) {
    return;
  }

  const installmentAmount = parseAmountInput(ui.needInstallmentAmount.value);
  const termMonths = Number.parseInt(ui.needInstallmentTerm.value, 10);
  const monthlyRate = Number.parseFloat(ui.needInstallmentRateInput.value);
  const effectiveMonthlyRate = getEffectiveLoanMonthlyRate(monthlyRate, getCurrentLoanType());
  let hasError = false;

  clearNeedCalcFormErrors(ui.needInstallmentForm);

  if (!Number.isFinite(installmentAmount) || installmentAmount <= 0) {
    setNeedCalcFieldError(ui.needInstallmentAmount, "Taksit tutarı gir.");
    hasError = true;
  }
  if (!Number.isFinite(termMonths) || termMonths <= 0) {
    setNeedCalcFieldError(ui.needInstallmentTerm, "Vade seç.");
    hasError = true;
  }
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0) {
    setNeedCalcFieldError(ui.needInstallmentRateInput, "Faiz oranı gir.");
    hasError = true;
  }

  if (hasError) {
    ui.needInstallmentResult.classList.add("hidden");
    if (ui.needCalcScheduleSection) {
      ui.needCalcScheduleSection.classList.add("hidden");
    }
    return;
  }

  const estimatedPrincipal = calculatePrincipalFromInstallment(installmentAmount, effectiveMonthlyRate, termMonths);
  const totalPayment = installmentAmount * termMonths;
  const totalInterest = totalPayment - estimatedPrincipal;

  ui.needInstallmentPrincipal.textContent = formatTry(estimatedPrincipal);
  ui.needInstallmentTotal.textContent = formatTry(totalPayment);
  ui.needInstallmentInterest.textContent = formatTry(totalInterest);
  if (ui.needInstallmentNote) {
    ui.needInstallmentNote.textContent = buildLoanTaxNote(getCurrentLoanType());
  }
  renderLoanPaymentSchedule({
    tbodyElement: ui.needCalcScheduleBody,
    principal: estimatedPrincipal,
    nominalMonthlyRatePercent: monthlyRate,
    loanType: getCurrentLoanType(),
    termMonths,
    paymentOverride: installmentAmount,
  });
  if (ui.needCalcScheduleTitle) {
    ui.needCalcScheduleTitle.textContent = "Ödeme Planı";
  }
  if (ui.needCalcScheduleSection) {
    ui.needCalcScheduleSection.classList.remove("hidden");
  }
  ui.needInstallmentResult.classList.remove("hidden");
}

function renderDepositCalculator() {
  if (
    !ui.depositPrincipal ||
    !ui.depositTermDays ||
    !ui.depositRate ||
    !ui.depositCalcResult ||
    !ui.depositGrossReturn ||
    !ui.depositWithholdingAmount ||
    !ui.depositNetReturn ||
    !ui.depositMaturityAmount
  ) {
    return;
  }

  const principal = parseAmountInput(ui.depositPrincipal.value);
  const termDays = Number.parseInt(ui.depositTermDays.value, 10);
  const annualRate = Number.parseFloat(ui.depositRate.value);

  if (
    !Number.isFinite(principal) ||
    principal <= 0 ||
    !Number.isFinite(termDays) ||
    termDays <= 0 ||
    !Number.isFinite(annualRate) ||
    annualRate < 0
  ) {
    alert("Lütfen geçerli bir mevduat tutarı, vade ve faiz oranı gir.");
    return;
  }

  const {
    grossReturn,
    withholdingAmount,
    netReturn,
    maturityAmount,
  } = calculateDepositOutcome(principal, annualRate, termDays);

  ui.depositGrossReturn.textContent = formatTry(grossReturn);
  ui.depositWithholdingAmount.textContent = formatTry(withholdingAmount);
  ui.depositNetReturn.textContent = formatTry(netReturn);
  ui.depositMaturityAmount.textContent = formatTry(maturityAmount);
  ui.depositCalcResult.classList.remove("hidden");
}

function renderInvestmentDepositOffers(showAlert = false) {
  if (
    !ui.investmentDepositPrincipal ||
    !ui.investmentDepositTermDays ||
    !ui.investmentDepositOffersList ||
    !ui.investmentDepositOfferTitle
  ) {
    return;
  }

  const principal = parseAmountInput(ui.investmentDepositPrincipal.value);
  const termDays = Number.parseInt(ui.investmentDepositTermDays.value, 10);
  if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(termDays) || termDays <= 0) {
    if (showAlert) {
      alert("Lütfen geçerli bir mevduat tutarı ve vade gir.");
    }
    return;
  }

  const accountTypeFilter = ui.investmentDepositAccountTypeFilter?.value || "all";
  const bankTypeFilter = ui.investmentDepositBankTypeFilter?.value || "all";
  const matchingOffers = DEPOSIT_OFFER_CATALOG
    .filter((offer) => accountTypeFilter === "all" || offer.accountType === accountTypeFilter)
    .filter((offer) => bankTypeFilter === "all" || offer.bankType === bankTypeFilter)
    .map((offer) => ({
      ...offer,
      outcome: calculateDepositOutcome(principal, offer.annualRate, termDays),
    }))
    .sort((leftOffer, rightOffer) => rightOffer.outcome.netReturn - leftOffer.outcome.netReturn);

  ui.investmentDepositOfferTitle.textContent =
    `${formatTry(principal)} TL için ${termDays} gün vadeli mevduat karşılaştırması`;

  if (ui.investmentSilverMeta) {
    ui.investmentSilverMeta.textContent = `Güncelleme: ${formatCurrentDate()}`;
  }

  if (matchingOffers.length === 0) {
    ui.investmentDepositOffersList.replaceChildren(createDepositOfferEmptyState());
    return;
  }

  const fragment = document.createDocumentFragment();
  matchingOffers.forEach((offer, index) => {
    fragment.append(createDepositOfferCard(offer, index === 0));
  });
  ui.investmentDepositOffersList.replaceChildren(fragment);
}

function renderLoanOffersFromPrincipal() {
  if (!ui.needPrincipal || !ui.needTerm) {
    return;
  }

  renderLoanOffers({
    mode: "principal",
    loanType: getCurrentLoanType(),
    principal: parseAmountInput(ui.needPrincipal.value),
    termMonths: Number.parseInt(ui.needTerm.value, 10),
  });
}

function renderLoanOffersFromInstallment() {
  if (!ui.needInstallmentAmount || !ui.needInstallmentTerm) {
    return;
  }

  renderLoanOffers({
    mode: "installment",
    loanType: getCurrentLoanType(),
    installmentAmount: parseAmountInput(ui.needInstallmentAmount.value),
    termMonths: Number.parseInt(ui.needInstallmentTerm.value, 10),
  });
}

function getCurrentLoanType() {
  const datasetLoanType = String(ui.calculationPage?.dataset.loanType || "need");
  if (datasetLoanType === "housing" || datasetLoanType === "vehicle") {
    return datasetLoanType;
  }
  return "need";
}

function getEffectiveLoanMonthlyRate(monthlyRatePercent, loanType) {
  const safeRate = Number(monthlyRatePercent);
  if (!Number.isFinite(safeRate) || safeRate < 0) {
    return 0;
  }

  const typeConfig = LOAN_TYPE_CONFIG[loanType] || LOAN_TYPE_CONFIG.need;
  const bsmvRate = Number(typeConfig?.taxes?.bsmv || 0);
  const kkdfRate = Number(typeConfig?.taxes?.kkdf || 0);
  return safeRate * (1 + bsmvRate + kkdfRate);
}

function getLoanTaxRates(loanType) {
  const typeConfig = LOAN_TYPE_CONFIG[loanType] || LOAN_TYPE_CONFIG.need;
  return {
    bsmv: Number(typeConfig?.taxes?.bsmv || 0),
    kkdf: Number(typeConfig?.taxes?.kkdf || 0),
  };
}

function buildLoanTaxNote(loanType) {
  const normalizedLoanType = String(loanType || "").trim().toLowerCase();
  if (normalizedLoanType === "housing") {
    return "Toplam ödemeye % 0 KKDF ve % 0 BSMV dahil, diğer masraflar hariçtir.";
  }
  return "Toplam ödemeye % 15 KKDF ve % 15 BSMV dahil, diğer masraflar hariçtir.";
}

function buildLoanPaymentSchedule({
  principal,
  nominalMonthlyRatePercent,
  loanType,
  termMonths,
  paymentOverride = null,
}) {
  if (
    !Number.isFinite(principal) ||
    principal <= 0 ||
    !Number.isFinite(nominalMonthlyRatePercent) ||
    nominalMonthlyRatePercent < 0 ||
    !Number.isFinite(termMonths) ||
    termMonths <= 0
  ) {
    return [];
  }

  const taxRates = getLoanTaxRates(loanType);
  const nominalMonthlyRate = nominalMonthlyRatePercent / 100;
  const effectiveMonthlyRate = getEffectiveLoanMonthlyRate(nominalMonthlyRatePercent, loanType);
  const basePayment = Number.isFinite(paymentOverride) && paymentOverride > 0
    ? paymentOverride
    : calculateInstallment(principal, effectiveMonthlyRate, termMonths);

  let remainingPrincipal = principal;
  const rows = [];

  for (let installmentIndex = 1; installmentIndex <= termMonths; installmentIndex += 1) {
    const interestAmount = remainingPrincipal * nominalMonthlyRate;
    const kkdfAmount = interestAmount * taxRates.kkdf;
    const bsmvAmount = interestAmount * taxRates.bsmv;
    const totalCharge = interestAmount + kkdfAmount + bsmvAmount;
    let principalAmount = basePayment - totalCharge;
    let paymentAmount = basePayment;

    if (installmentIndex === termMonths || principalAmount > remainingPrincipal) {
      principalAmount = remainingPrincipal;
      paymentAmount = principalAmount + totalCharge;
    }

    remainingPrincipal = Math.max(0, remainingPrincipal - principalAmount);
    rows.push({
      installmentIndex,
      paymentAmount,
      principalAmount,
      interestAmount,
      kkdfAmount,
      bsmvAmount,
      remainingPrincipal,
    });
  }

  return rows;
}

function renderLoanPaymentSchedule({
  tbodyElement,
  principal,
  nominalMonthlyRatePercent,
  loanType,
  termMonths,
  paymentOverride = null,
}) {
  if (!(tbodyElement instanceof HTMLElement)) {
    return;
  }

  const rows = buildLoanPaymentSchedule({
    principal,
    nominalMonthlyRatePercent,
    loanType,
    termMonths,
    paymentOverride,
  });

  const fragment = document.createDocumentFragment();
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    [
      String(row.installmentIndex),
      `${formatTryWithCents(row.paymentAmount)} TL`,
      `${formatTry(row.principalAmount)} TL`,
      `${formatTry(row.interestAmount)} TL`,
      `${formatTry(row.kkdfAmount)} TL`,
      `${formatTry(row.bsmvAmount)} TL`,
      `${formatTry(row.remainingPrincipal)} TL`,
    ].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    });
    fragment.append(tr);
  });

  tbodyElement.replaceChildren(fragment);
}

function renderLoanOffers({
  mode,
  loanType,
  principal = 0,
  installmentAmount = 0,
  termMonths = 0,
}) {
  if (!ui.loanOffersList || !ui.loanOffersTitle || !ui.loanOffersMeta || !ui.loanOffersPanel) {
    return;
  }

  const catalog = Array.isArray(LOAN_OFFER_CATALOG[loanType]) ? LOAN_OFFER_CATALOG[loanType] : [];
  if (!catalog.length || !Number.isFinite(termMonths) || termMonths <= 0) {
    ui.loanOffersList.replaceChildren(createDepositOfferEmptyState());
    ui.loanOffersTitle.textContent = "Kredi teklifleri hazırlanıyor";
    ui.loanOffersMeta.textContent = "Teklif kartları birazdan burada görünür.";
    ui.loanOffersPanel.classList.remove("hidden");
    return;
  }

  const loanTypeLabels = {
    need: "ihtiyaç kredisi",
    housing: "konut kredisi",
    vehicle: "taşıt kredisi",
  };
  const loanTypeLabel = loanTypeLabels[loanType] || "kredi";

  const offers = catalog
    .map((offer) => {
      if (mode === "installment") {
        const estimatedPrincipal = calculatePrincipalFromInstallment(
          installmentAmount,
          offer.monthlyRate,
          termMonths,
        );
        const totalPayment = installmentAmount * termMonths;
        const totalInterest = totalPayment - estimatedPrincipal;
        return {
          ...offer,
          scoreValue: estimatedPrincipal,
          metrics: [
            ["Tahmini Kredi", `${formatTry(estimatedPrincipal)} TL`],
            ["Toplam Ödeme", `${formatTry(totalPayment)} TL`],
            ["Toplam Faiz", `${formatTry(totalInterest)} TL`],
          ],
        };
      }

      const monthlyPayment = calculateInstallment(principal, offer.monthlyRate, termMonths);
      const totalPayment = monthlyPayment * termMonths;
      const totalInterest = totalPayment - principal;
      return {
        ...offer,
        scoreValue: -monthlyPayment,
        metrics: [
          ["Aylık Taksit", `${formatTryWithCents(monthlyPayment)} TL`],
          ["Toplam Ödeme", `${formatTry(totalPayment)} TL`],
          ["Toplam Faiz", `${formatTry(totalInterest)} TL`],
        ],
      };
    })
    .sort((leftOffer, rightOffer) => rightOffer.scoreValue - leftOffer.scoreValue);

  ui.loanOffersTitle.textContent = mode === "installment"
    ? `${formatTry(installmentAmount)} TL taksit için ${termMonths} ay vadeli ${loanTypeLabel} karşılaştırması`
    : `${formatTry(principal)} TL için ${termMonths} ay vadeli ${loanTypeLabel} karşılaştırması`;
  ui.loanOffersMeta.textContent = mode === "installment"
    ? "Çekilebilir tutara göre örnek sıralama"
    : "Aylık taksite göre örnek sıralama";

  const fragment = document.createDocumentFragment();
  offers.forEach((offer, index) => {
    fragment.append(createLoanOfferCard(offer, index === 0));
  });
  ui.loanOffersList.replaceChildren(fragment);
  ui.loanOffersPanel.classList.remove("hidden");
}

function createLoanOfferCard(offer, isBestOffer) {
  const article = document.createElement("article");
  article.className = "deposit-offer-card";

  const topRow = document.createElement("div");
  topRow.className = "deposit-offer-top";

  const headingWrap = document.createElement("div");
  headingWrap.className = "deposit-offer-heading";

  const badge = document.createElement("span");
  badge.className = `deposit-offer-badge${isBestOffer ? " is-best" : ""}`;
  badge.textContent = isBestOffer ? "Öne Çıkan Teklif" : offer.badge;
  headingWrap.append(badge);

  const logoElement = createBankLogoElement(offer.bank, "deposit-offer-logo");
  if (logoElement) {
    headingWrap.append(logoElement);
  }

  const productName = document.createElement("p");
  productName.className = "deposit-offer-product";
  productName.textContent = offer.product;
  headingWrap.append(productName);

  const rateWrap = document.createElement("div");
  rateWrap.className = "deposit-offer-rate-wrap";
  const rateLabel = document.createElement("span");
  rateLabel.className = "deposit-offer-rate-label";
  rateLabel.textContent = "Aylık Faiz Oranı";
  const rateValue = document.createElement("strong");
  rateValue.className = "deposit-offer-rate";
  rateValue.textContent = `%${offer.monthlyRate.toFixed(2).replace(".", ",")}`;
  rateWrap.append(rateLabel, rateValue);

  topRow.append(headingWrap, rateWrap);

  const metrics = document.createElement("div");
  metrics.className = "deposit-offer-metrics";
  offer.metrics.forEach(([label, value]) => {
    const metric = document.createElement("article");
    metric.className = "deposit-offer-metric";
    const metricLabel = document.createElement("span");
    metricLabel.textContent = label;
    const metricValue = document.createElement("strong");
    metricValue.textContent = value;
    metric.append(metricLabel, metricValue);
    metrics.append(metric);
  });

  const note = document.createElement("p");
  note.className = "deposit-offer-note";
  note.textContent = offer.note;

  const action = document.createElement("button");
  action.type = "button";
  action.className = "deposit-offer-action";
  action.textContent = offer.actionLabel;

  article.append(topRow, metrics, note, action);
  return article;
}

function createDepositOfferCard(offer, isBestOffer) {
  const article = document.createElement("article");
  article.className = "deposit-offer-card";

  const topRow = document.createElement("div");
  topRow.className = "deposit-offer-top";

  const headingWrap = document.createElement("div");
  headingWrap.className = "deposit-offer-heading";
  const badge = document.createElement("span");
  badge.className = `deposit-offer-badge${isBestOffer ? " is-best" : ""}`;
  badge.textContent = isBestOffer ? "En Yüksek Net Getiri" : offer.badge;
  headingWrap.append(badge);

  const logoElement = createBankLogoElement(offer.bank, "deposit-offer-logo");
  if (logoElement) {
    headingWrap.append(logoElement);
  }

  const productName = document.createElement("p");
  productName.className = "deposit-offer-product";
  productName.textContent = offer.product;
  headingWrap.append(productName);

  const rateWrap = document.createElement("div");
  rateWrap.className = "deposit-offer-rate-wrap";
  const rateLabel = document.createElement("span");
  rateLabel.className = "deposit-offer-rate-label";
  rateLabel.textContent = "Faiz Oranı";
  const rateValue = document.createElement("strong");
  rateValue.className = "deposit-offer-rate";
  rateValue.textContent = `%${offer.annualRate.toFixed(2).replace(".", ",")}`;
  rateWrap.append(rateLabel, rateValue);

  topRow.append(headingWrap, rateWrap);

  const metrics = document.createElement("div");
  metrics.className = "deposit-offer-metrics";
  [
    ["Net Getiri", `${formatTry(offer.outcome.netReturn)} TL`],
    ["Brüt Getiri", `${formatTry(offer.outcome.grossReturn)} TL`],
    ["Vade Sonu", `${formatTry(offer.outcome.maturityAmount)} TL`],
  ].forEach(([label, value]) => {
    const metric = document.createElement("article");
    metric.className = "deposit-offer-metric";
    const metricLabel = document.createElement("span");
    metricLabel.textContent = label;
    const metricValue = document.createElement("strong");
    metricValue.textContent = value;
    metric.append(metricLabel, metricValue);
    metrics.append(metric);
  });

  const note = document.createElement("p");
  note.className = "deposit-offer-note";
  note.textContent = offer.note;

  const action = document.createElement("button");
  action.type = "button";
  action.className = "deposit-offer-action";
  action.textContent = offer.actionLabel;

  article.append(topRow, metrics, note, action);
  return article;
}

function createDepositOfferEmptyState() {
  const article = document.createElement("article");
  article.className = "deposit-offer-card";
  const emptyText = document.createElement("p");
  emptyText.className = "deposit-offer-empty";
  emptyText.textContent = "Seçtiğin filtrelere uygun teklif bulunamadı.";
  article.append(emptyText);
  return article;
}

function resolveBankLogoPath(bankName) {
  const normalizedName = normalizeTefasSearchText(bankName);
  return BANK_LOGO_MAP[normalizedName] || "";
}

function createBankLogoElement(bankName, className) {
  const logoPath = resolveBankLogoPath(bankName);
  if (!logoPath) {
    return null;
  }

  const logoImage = document.createElement("img");
  logoImage.className = className;
  logoImage.src = logoPath;
  logoImage.alt = `${bankName} logosu`;
  logoImage.loading = "lazy";
  return logoImage;
}

function renderCompoundCalculator() {
  if (
    !ui.compoundPrincipal ||
    !ui.compoundFrequency ||
    !ui.compoundRate ||
    !ui.compoundRateType ||
    !ui.compoundTerm ||
    !ui.compoundTermUnit ||
    !ui.compoundCalcResult ||
    !ui.compoundFinalAmount ||
    !ui.compoundTotalGain ||
    !ui.compoundEffectiveAnnualRate ||
    !ui.compoundPeriodGain
  ) {
    return;
  }

  const principal = parseAmountInput(ui.compoundPrincipal.value);
  const compoundingPerYear = getCompoundingFrequencyPerYear(ui.compoundFrequency.value);
  const ratePercent = Number.parseFloat(ui.compoundRate.value);
  const rateType = ui.compoundRateType.value;
  const termValue = Number.parseFloat(ui.compoundTerm.value);
  const termUnit = ui.compoundTermUnit.value;

  if (
    !Number.isFinite(principal) ||
    principal <= 0 ||
    !Number.isFinite(compoundingPerYear) ||
    compoundingPerYear <= 0 ||
    !Number.isFinite(ratePercent) ||
    ratePercent < 0 ||
    !Number.isFinite(termValue) ||
    termValue <= 0
  ) {
    alert("Lütfen geçerli bir anapara, faiz oranı, sıklık ve vade gir.");
    return;
  }

  const years = normalizeTermToYears(termValue, termUnit);
  const annualNominalRate = rateType === "monthly" ? (ratePercent * 12) / 100 : ratePercent / 100;
  const totalPeriods = compoundingPerYear * years;
  const finalAmount =
    annualNominalRate <= 0 ? principal : principal * (1 + annualNominalRate / compoundingPerYear) ** totalPeriods;
  const totalGain = finalAmount - principal;
  const periodGainPercent = principal > 0 ? (totalGain / principal) * 100 : 0;
  const effectiveAnnualRate =
    years > 0 && principal > 0 ? ((finalAmount / principal) ** (1 / years) - 1) * 100 : 0;

  ui.compoundFinalAmount.textContent = formatTry(finalAmount);
  ui.compoundTotalGain.textContent = formatTry(totalGain);
  ui.compoundEffectiveAnnualRate.textContent = formatPercent(effectiveAnnualRate);
  ui.compoundPeriodGain.textContent = formatPercent(periodGainPercent);
  ui.compoundCalcResult.classList.remove("hidden");
}

function renderRealCalculator() {
  if (
    !ui.realInitialAmount ||
    !ui.realFinalAmount ||
    !ui.realInflationRate ||
    !ui.realBuyDate ||
    !ui.realSellDate ||
    !ui.realCalcResult ||
    !ui.realResultInitial ||
    !ui.realResultFinal ||
    !ui.realResultNominalGain ||
    !ui.realResultNominalRate ||
    !ui.realResultInflationPeriod ||
    !ui.realResultRealGain ||
    !ui.realResultRealRate ||
    !ui.realResultInflationAdjusted ||
    !ui.realCalcInfo
  ) {
    return;
  }

  const initialAmount = parseAmountInput(ui.realInitialAmount.value);
  const finalAmount = parseAmountInput(ui.realFinalAmount.value);
  const annualInflationRate = Number.parseFloat(ui.realInflationRate.value);
  const buyDate = new Date(`${ui.realBuyDate.value}T00:00:00`);
  const sellDate = new Date(`${ui.realSellDate.value}T00:00:00`);

  if (
    !Number.isFinite(initialAmount) ||
    initialAmount <= 0 ||
    !Number.isFinite(finalAmount) ||
    finalAmount <= 0 ||
    !Number.isFinite(annualInflationRate) ||
    annualInflationRate < 0 ||
    Number.isNaN(buyDate.getTime()) ||
    Number.isNaN(sellDate.getTime()) ||
    sellDate.getTime() <= buyDate.getTime()
  ) {
    alert("Lütfen geçerli tutar, enflasyon oranı ve tarih aralığı gir.");
    return;
  }

  const elapsedDays = Math.max(
    1,
    Math.round((sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const periodYears = elapsedDays / 365;
  const nominalRate = (finalAmount / initialAmount) - 1;
  const periodInflationRate = (1 + (annualInflationRate / 100)) ** periodYears - 1;
  const realRate = ((1 + nominalRate) / (1 + periodInflationRate)) - 1;
  const nominalGain = finalAmount - initialAmount;
  const inflationAdjustedValue = finalAmount / (1 + periodInflationRate);
  const realGain = inflationAdjustedValue - initialAmount;

  ui.realResultInitial.textContent = formatTry(initialAmount);
  ui.realResultFinal.textContent = formatTry(finalAmount);
  ui.realResultNominalGain.textContent = formatTry(nominalGain);
  ui.realResultNominalRate.textContent = formatPercent(nominalRate * 100);
  ui.realResultInflationPeriod.textContent = formatPercent(periodInflationRate * 100);
  ui.realResultRealGain.textContent = formatTry(realGain);
  ui.realResultRealRate.textContent = formatPercent(realRate * 100);
  ui.realResultInflationAdjusted.textContent = formatTry(inflationAdjustedValue);
  ui.realCalcInfo.textContent = `Reel faiz formülü: ((1 + nominal getiri oranı) / (1 + dönem enflasyonu)) - 1 • Hesap dönemi ${elapsedDays} gün`;
  ui.realCalcResult.classList.remove("hidden");
}

function getCompoundingFrequencyPerYear(frequency) {
  const byFrequency = {
    monthly: 12,
    quarterly: 4,
    semiannual: 2,
    annual: 1,
  };
  return byFrequency[frequency] || 12;
}

function normalizeTermToYears(termValue, unit) {
  if (unit === "month") {
    return termValue / 12;
  }
  if (unit === "year") {
    return termValue;
  }
  return termValue / 365;
}

function getDepositWithholdingRate(termDays) {
  if (termDays <= 180) {
    return 0.175;
  }
  if (termDays <= 365) {
    return 0.15;
  }
  return 0.1;
}

function calculateDepositOutcome(principal, annualRate, termDays) {
  const grossReturn = principal * (annualRate / 100) * (termDays / 365);
  const withholdingRate = getDepositWithholdingRate(termDays);
  const withholdingAmount = grossReturn * withholdingRate;
  const netReturn = grossReturn - withholdingAmount;
  const maturityAmount = principal + netReturn;

  return {
    grossReturn,
    withholdingAmount,
    netReturn,
    maturityAmount,
  };
}

function calculateInstallment(principal, monthlyRatePercent, termMonths) {
  const monthlyRate = monthlyRatePercent / 100;
  if (monthlyRate <= 0) {
    return principal / termMonths;
  }

  const factor = (1 + monthlyRate) ** termMonths;
  return (principal * monthlyRate * factor) / (factor - 1);
}

function calculatePrincipalFromInstallment(installmentAmount, monthlyRatePercent, termMonths) {
  const monthlyRate = monthlyRatePercent / 100;
  if (monthlyRate <= 0) {
    return installmentAmount * termMonths;
  }

  const factor = (1 + monthlyRate) ** termMonths;
  return (installmentAmount * (factor - 1)) / (monthlyRate * factor);
}

function formatAmountInput(rawValue) {
  const digitsOnly = String(rawValue || "").replace(/[^\d]/g, "");
  if (!digitsOnly) {
    return "";
  }

  const numericValue = Number.parseInt(digitsOnly, 10);
  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function parseAmountInput(rawValue) {
  const normalizedValue = String(rawValue || "").replace(/,/g, "").trim();
  if (!normalizedValue) {
    return Number.NaN;
  }

  const numericValue = Number.parseFloat(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : Number.NaN;
}

function formatTry(amount) {
  const roundedAmount = Math.round(amount);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(roundedAmount);
}

function formatTryWithCents(amount) {
  const numericValue = Number(amount);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatPercentNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function formatPercent(value) {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

function toggleAuthTab(tabName) {
  const isSignIn = tabName === "signin";

  ui.signinTabButton.classList.toggle("active", isSignIn);
  ui.signupTabButton.classList.toggle("active", !isSignIn);
  ui.signinTabButton.setAttribute("aria-selected", String(isSignIn));
  ui.signupTabButton.setAttribute("aria-selected", String(!isSignIn));
  ui.signinForm.classList.toggle("hidden", !isSignIn);
  ui.signupForm.classList.toggle("hidden", isSignIn);
}

function handleSignInSubmit(event) {
  event.preventDefault();

  const formData = new FormData(ui.signinForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!isValidEmail(email)) {
    alert("Lütfen geçerli bir e-posta gir.");
    return;
  }

  if (password.length < 6) {
    alert("Şifre en az 6 karakter olmalıdır.");
    return;
  }

  alert(`Hoş geldin ${email}. Giriş başarılı (demo).`);
  ui.signinForm.reset();
  closeAuthPopover();
}

function handleSignUpSubmit(event) {
  event.preventDefault();

  const formData = new FormData(ui.signupForm);
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const passwordAgain = String(formData.get("password_again") || "");
  const hasConsent = formData.get("consent") === "on";

  if (fullName.length < 3) {
    alert("Ad Soyad en az 3 karakter olmalıdır.");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Lütfen geçerli bir e-posta gir.");
    return;
  }

  if (password.length < 6) {
    alert("Şifre en az 6 karakter olmalıdır.");
    return;
  }

  if (password !== passwordAgain) {
    alert("Şifreler aynı olmalıdır.");
    return;
  }

  if (!hasConsent) {
    alert("Devam etmek için sözleşme onayı gerekli.");
    return;
  }

  alert(`Kayıt oluşturuldu: ${fullName} (demo).`);
  ui.signupForm.reset();
  closeAuthPopover();
}

function closeAuthPopover() {
  if (!ui.authPopover || !ui.authToggle) {
    return;
  }

  ui.authPopover.classList.add("hidden");
  ui.authToggle.setAttribute("aria-expanded", "false");
}

function isValidEmail(value) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
}

function metaTextForQuestion(question) {
  if (question.answer_type === "single_choice") {
    return "";
  }
  if (question.answer_type === "number" || question.answer_type === "currency") {
    return "Tutarı gir";
  }
  if (question.answer_type === "text") {
    return "Kısa ve net yaz";
  }
  return "Cevabını seç ya da yaz";
}

function hasCurrentAnswer() {
  if (state.phase === "consent") {
    return ui.consentCheckbox.checked;
  }

  if (state.phase !== "questions") {
    return false;
  }

  const question = state.questions[state.currentIndex];
  if (!question) {
    return false;
  }

  if (question.answer_type === "single_choice") {
    return ui.answerArea.querySelector(".choice.selected") !== null;
  }

  if (question.answer_type === "number" || question.answer_type === "currency") {
    const input = ui.answerArea.querySelector("input");
    if (!input) {
      return false;
    }
    const raw = input.value;
    if (!raw) {
      return !question.required;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0;
  }

  if (question.answer_type === "text") {
    const textarea = ui.answerArea.querySelector("textarea");
    const value = textarea ? textarea.value.trim() : "";
    return question.required ? value.length > 0 : true;
  }

  return true;
}

function updatePrimaryActionState() {
  if (state.phase === "consent") {
    ui.nextButton.disabled = !ui.consentCheckbox.checked;
    ui.nextButton.classList.toggle("consent-pending", ui.nextButton.disabled);
    return;
  }

  ui.nextButton.classList.remove("consent-pending");
  if (state.phase === "questions") {
    ui.nextButton.disabled = !hasCurrentAnswer();
  }
}

function asNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return clamp(parsed, 0, MAX_INPUT_NUMBER);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("\u0131", "i")
    .replaceAll("\u011f", "g")
    .replaceAll("\u015f", "s")
    .replaceAll("\u00fc", "u")
    .replaceAll("\u00f6", "o")
    .replaceAll("\u00e7", "c");
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(value, maximum));
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...(options || {}),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
