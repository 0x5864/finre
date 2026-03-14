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
const LOAN_TYPE_CONFIG = {
  need: {
    defaultPrincipal: 50_000,
    defaultInstallment: 5_000,
    defaultRate: 2.49,
    terms: [6, 12, 24, 36],
    defaultTerm: 12,
  },
  housing: {
    defaultPrincipal: 1_000_000,
    defaultInstallment: 30_000,
    defaultRate: 2.89,
    terms: [12, 24, 36, 48, 60, 84, 120],
    defaultTerm: 120,
  },
  vehicle: {
    defaultPrincipal: 400_000,
    defaultInstallment: 12_000,
    defaultRate: 3.19,
    terms: [6, 12, 24, 36, 48],
    defaultTerm: 24,
  },
  deposit: {},
  compound: {},
  real: {},
};
const ROUTE_HASH = Object.freeze({
  home: "#anasayfa",
  loan: "#kredi",
  bankIsbank: "#banka-is-bankasi",
  calculation: "#hesaplama",
  investment: "#yatirim",
  investmentFx: "#yatirim-doviz",
  investmentStock: "#yatirim-borsa",
  investmentFund: "#yatirim-fon",
  investmentGold: "#yatirim-altin",
  investmentSilver: "#yatirim-gumus",
});
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
    cards: [
      {
        bank: "Akbank",
        product: "Direkt İhtiyaç Kredisi",
        monthlyRate: 2.99,
        badge: "Hızlı Başvuru",
        note: "Kısa sürede dijital başvuru ve hızlı ön değerlendirme sunar.",
      },
      {
        bank: "QNB",
        product: "QNB İhtiyaç Kredisi",
        monthlyRate: 3.09,
        badge: "Online",
        note: "Uygulama ve internet şube üzerinden pratik akış sağlar.",
      },
      {
        bank: "ING",
        product: "Turuncu İhtiyaç Kredisi",
        monthlyRate: 3.18,
        badge: "Dijital",
        note: "Dijital müşteriler için sade ve hızlı kredi deneyimi verir.",
      },
    ],
    rows: [
      { bank: "Akbank", rate: 0.99, monthlyInstallment: 4523, totalPayment: 54531 },
      { bank: "QNB", rate: 1.99, monthlyInstallment: 4900, totalPayment: 59051 },
      { bank: "ING", rate: 3.29, monthlyInstallment: 5414, totalPayment: 65213 },
      { bank: "DenizBank", rate: 3.61, monthlyInstallment: 5544, totalPayment: 66778 },
      { bank: "İş Bankası", rate: 3.74, monthlyInstallment: 5601, totalPayment: 67212 },
      { bank: "Garanti BBVA", rate: 3.78, monthlyInstallment: 5617, totalPayment: 67404 },
      { bank: "Yapı Kredi", rate: 3.82, monthlyInstallment: 5633, totalPayment: 67596 },
    ],
  },
  housing: {
    title: "Konut Kredisi Banka Karşılaştırması",
    dateLabel: "Güncelleme: 13 Mart 2026",
    cards: [
      {
        bank: "Ziraat Bankası",
        product: "Ziraat Konut Kredisi",
        monthlyRate: 2.79,
        badge: "Kamu",
        note: "Uzun vade ihtiyacında dengeli taksit yapısı sunar.",
      },
      {
        bank: "Vakıfbank",
        product: "SarıPanjur Konut Kredisi",
        monthlyRate: 2.82,
        badge: "Kamu",
        note: "Konut finansmanında klasik ve geniş kitleye uygun yapı sunar.",
      },
      {
        bank: "İş Bankası",
        product: "İş Bankası Konut Kredisi",
        monthlyRate: 2.88,
        badge: "Standart",
        note: "Masraf ve taksit dengesini birlikte görmek isteyenlere uygundur.",
      },
    ],
    rows: [
      { bank: "Ziraat Bankası", rate: 2.79, monthlyInstallment: 29354, totalPayment: 3522480 },
      { bank: "Vakıfbank", rate: 2.82, monthlyInstallment: 29602, totalPayment: 3552240 },
      { bank: "Akbank", rate: 2.84, monthlyInstallment: 29768, totalPayment: 3572160 },
      { bank: "İş Bankası", rate: 2.88, monthlyInstallment: 30102, totalPayment: 3612240 },
      { bank: "Garanti BBVA", rate: 2.91, monthlyInstallment: 30354, totalPayment: 3642480 },
      { bank: "Yapı Kredi", rate: 2.95, monthlyInstallment: 30692, totalPayment: 3683040 },
    ],
  },
  vehicle: {
    title: "Taşıt Kredisi Banka Karşılaştırması",
    dateLabel: "Güncelleme: 13 Mart 2026",
    cards: [
      {
        bank: "Akbank",
        product: "Akbank Taşıt Kredisi",
        monthlyRate: 3.15,
        badge: "Yeni Araç",
        note: "Yeni araç finansmanında hızlı ön başvuru sunar.",
      },
      {
        bank: "QNB",
        product: "QNB Taşıt Kredisi",
        monthlyRate: 3.19,
        badge: "Online",
        note: "Mobil uygulama üzerinden kolay takip ve başvuru sağlar.",
      },
      {
        bank: "Garanti BBVA",
        product: "Garanti BBVA Taşıt Kredisi",
        monthlyRate: 3.27,
        badge: "Mobil",
        note: "Taşıt finansmanında dijital süreç isteyenler için uygundur.",
      },
    ],
    rows: [
      { bank: "Akbank", rate: 3.15, monthlyInstallment: 25248, totalPayment: 605952 },
      { bank: "QNB", rate: 3.19, monthlyInstallment: 25384, totalPayment: 609216 },
      { bank: "İş Bankası", rate: 3.24, monthlyInstallment: 25556, totalPayment: 613344 },
      { bank: "Garanti BBVA", rate: 3.27, monthlyInstallment: 25661, totalPayment: 615864 },
      { bank: "TEB", rate: 3.31, monthlyInstallment: 25802, totalPayment: 619248 },
      { bank: "ING", rate: 3.35, monthlyInstallment: 25944, totalPayment: 622656 },
    ],
  },
  kobi: {
    title: "KOBİ Kredisi Banka Karşılaştırması",
    dateLabel: "Güncelleme: 13 Mart 2026",
    cards: [
      {
        bank: "Akbank",
        product: "KOBİ Destek Kredisi",
        monthlyRate: 3.45,
        badge: "İşletme",
        note: "Nakit akışını rahatlatmak isteyen işletmeler için örnek yapı sunar.",
      },
      {
        bank: "QNB",
        product: "Ticari Destek Kredisi",
        monthlyRate: 3.52,
        badge: "Ticari",
        note: "KOBİ tarafında online başvuru ile hız kazandırır.",
      },
      {
        bank: "DenizBank",
        product: "Esnaf Kredisi",
        monthlyRate: 3.59,
        badge: "Esnaf",
        note: "Esnaf ve küçük işletmeler için pratik kredi akışı sunar.",
      },
    ],
    rows: [
      { bank: "Akbank", rate: 3.45, monthlyInstallment: 11276, totalPayment: 270624 },
      { bank: "QNB", rate: 3.52, monthlyInstallment: 11394, totalPayment: 273456 },
      { bank: "DenizBank", rate: 3.59, monthlyInstallment: 11514, totalPayment: 276336 },
      { bank: "İş Bankası", rate: 3.64, monthlyInstallment: 11601, totalPayment: 278424 },
      { bank: "Garanti BBVA", rate: 3.69, monthlyInstallment: 11689, totalPayment: 280536 },
    ],
  },
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
  ing: "./assets/banks/ing-official-transparent.png?v=1",
  "ing bank": "./assets/banks/ing-official-transparent.png?v=1",
  "ing bank a.ş.": "./assets/banks/ing-official-transparent.png?v=1",
  "ing bank a.s.": "./assets/banks/ing-official-transparent.png?v=1",
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
  loanRatesTitle: document.getElementById("loanRatesTitle"),
  loanRatesDate: document.getElementById("loanRatesDate"),
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
  needInstallmentForm: document.getElementById("needInstallmentForm"),
  needInstallmentAmount: document.getElementById("needInstallmentAmount"),
  needInstallmentTerm: document.getElementById("needInstallmentTerm"),
  needInstallmentRateInput: document.getElementById("needInstallmentRateInput"),
  needInstallmentResult: document.getElementById("needInstallmentResult"),
  needInstallmentPrincipal: document.getElementById("needInstallmentPrincipal"),
  needInstallmentTotal: document.getElementById("needInstallmentTotal"),
  needInstallmentInterest: document.getElementById("needInstallmentInterest"),
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

void boot();

async function boot() {
  state.questions = await loadQuestions();
  state.currentIndex = 0;
  state.answers = {};
  state.sessionId = "";
  state.phase = "consent";
  state.consentAccepted = false;
  ui.consentCheckbox.checked = false;
  await initializeSession();
  renderConsent();
  lockInitialLayoutHeight();
  lockInitialPanelHeights();
  applyRouteFromHash();
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

  ui.loanRatesTabs?.forEach((tabElement) => {
    tabElement.addEventListener("click", () => {
      renderLoanRatesPage(String(tabElement.dataset.loanRatesTab || "need"));
    });
  });

  if (ui.openNeedLoanRates) {
    ui.openNeedLoanRates.addEventListener("click", () => {
      openLoanRatesPage();
    });
  }

  if (ui.openIsbankProfile) {
    ui.openIsbankProfile.addEventListener("click", () => {
      openBankDetailPage();
    });
  }

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
    }
  });

  window.addEventListener("hashchange", () => {
    if (suppressHashRouteSync) {
      suppressHashRouteSync = false;
      return;
    }
    applyRouteFromHash();
  });

  setupNeedLoanCalculator();
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

  if (ui.loanRateCards) {
    const cardsFragment = document.createDocumentFragment();
    tabData.cards.forEach((cardData, index) => {
      cardsFragment.append(createLoanRatesHighlightCard(cardData, index === 0));
    });
    ui.loanRateCards.replaceChildren(cardsFragment);
  }

  if (ui.loanRatesTableBody) {
    const rowsFragment = document.createDocumentFragment();
    tabData.rows.forEach((rowData) => {
      rowsFragment.append(createLoanRatesRow(rowData));
    });
    ui.loanRatesTableBody.replaceChildren(rowsFragment);
  }
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
  const bankName = document.createElement("span");
  bankName.className = "bank-logo-name";
  bankName.textContent = rowData.bank;
  bankWrap.append(bankName);
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
  actionCell.append(actionButton);

  tr.append(bankCell, rateCell, installmentCell, totalCell, actionCell);
  return tr;
}

function openLoanRatesPage(options = {}) {
  const { updateHash = true, tabKey } = options;
  closeAuthPopover();
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
    updateRouteHash(ROUTE_HASH.loan);
  }
}

function closeLoanRatesPage(options = {}) {
  const { updateHash = true } = options;
  if (ui.loanRatesPage) {
    ui.loanRatesPage.classList.add("hidden");
  }
  syncSubpageBodyClasses();
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.home);
  }
}

function openBankDetailPage(options = {}) {
  const { updateHash = true } = options;
  closeAuthPopover();
  if (ui.loanRatesPage) {
    ui.loanRatesPage.classList.add("hidden");
  }
  if (ui.calculationPage) {
    ui.calculationPage.classList.add("hidden");
  }
  if (ui.investmentPage) {
    ui.investmentPage.classList.add("hidden");
  }
  if (ui.bankDetailPage) {
    ui.bankDetailPage.classList.remove("hidden");
  }
  syncSubpageBodyClasses();
  setActiveHeaderNav("loan");
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.bankIsbank);
  }
}

function closeBankDetailPage(options = {}) {
  const { updateHash = true } = options;
  if (ui.bankDetailPage) {
    ui.bankDetailPage.classList.add("hidden");
  }
  syncSubpageBodyClasses();
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.home);
  }
}

function openCalculationPage(options = {}) {
  const { updateHash = true } = options;
  closeAuthPopover();
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
    updateRouteHash(ROUTE_HASH.calculation);
  }
}

function closeCalculationPage(options = {}) {
  const { updateHash = true } = options;
  if (ui.calculationPage) {
    ui.calculationPage.classList.add("hidden");
  }
  syncSubpageBodyClasses();
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.home);
  }
}

function openInvestmentPage(options = {}) {
  const { updateHash = true } = options;
  closeAuthPopover();
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
  stopMarketRefreshTimer();
  syncSubpageBodyClasses();
  setActiveHeaderNav("investment");
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.investment);
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
  syncSubpageBodyClasses();
  if (updateHash) {
    updateRouteHash(ROUTE_HASH.home);
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

  if (updateHash) {
    if (isFxSection) {
      updateRouteHash(ROUTE_HASH.investmentFx);
    } else if (isStockSection) {
      updateRouteHash(ROUTE_HASH.investmentStock);
    } else if (isFundSection) {
      updateRouteHash(ROUTE_HASH.investmentFund);
    } else if (isGoldSection) {
      updateRouteHash(ROUTE_HASH.investmentGold);
    } else if (isSilverSection) {
      updateRouteHash(ROUTE_HASH.investmentSilver);
    } else {
      updateRouteHash(ROUTE_HASH.investment);
    }
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

function applyRouteFromHash() {
  const normalizedHash = String(window.location.hash || "")
    .trim()
    .toLowerCase();

  if (normalizedHash === ROUTE_HASH.calculation) {
    openCalculationPage({ updateHash: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.loan) {
    openLoanRatesPage({ updateHash: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.bankIsbank) {
    openBankDetailPage({ updateHash: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.investment) {
    openInvestmentPage({ updateHash: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.investmentFx) {
    openInvestmentPage({ updateHash: false });
    revealInvestmentSection("fx", { updateHash: false, smoothScroll: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.investmentStock) {
    openInvestmentPage({ updateHash: false });
    revealInvestmentSection("stock", { updateHash: false, smoothScroll: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.investmentFund) {
    openInvestmentPage({ updateHash: false });
    revealInvestmentSection("fund", { updateHash: false, smoothScroll: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.investmentGold) {
    openInvestmentPage({ updateHash: false });
    revealInvestmentSection("gold", { updateHash: false, smoothScroll: false });
    return;
  }

  if (normalizedHash === ROUTE_HASH.investmentSilver) {
    openInvestmentPage({ updateHash: false });
    revealInvestmentSection("silver", { updateHash: false, smoothScroll: false });
    return;
  }

  closeBankDetailPage({ updateHash: false });
  closeLoanRatesPage({ updateHash: false });
  closeCalculationPage({ updateHash: false });
  closeInvestmentPage({ updateHash: false });
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
    ui.investmentFxBody.replaceChildren(createEmptyRow("Döviz verisi yükleniyor...", 7));
  }
  if (!silent && ui.investmentFxMeta) {
    ui.investmentFxMeta.textContent = "Kaynak: Kapalıçarşı";
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

  const normalizedRows = rows.filter((row) => row && typeof row === "object");
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
    ui.investmentFxMeta.textContent = `Kaynak: ${sourceLabel}`;
  }
}

async function loadGoldPriceTable(options = {}) {
  const { forceRefresh = false, silent = false } = options;
  if (!ui.investmentGoldBody) {
    return;
  }

  if (!silent) {
    ui.investmentGoldBody.replaceChildren(createEmptyRow("Altın verisi yükleniyor...", 7));
  }
  if (!silent && ui.investmentGoldMeta) {
    ui.investmentGoldMeta.textContent = "Kaynak: Kapalıçarşı";
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
        return apiPayload;
      }
    }
  } catch (_error) {
    // Fall back to local snapshot files.
  }

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

  throw new Error("Gold data file not found");
}

function renderGoldPriceTable(rows, payload) {
  if (!ui.investmentGoldBody) {
    return;
  }

  const normalizedRows = rows.filter((row) => row && typeof row === "object");
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
    ui.investmentGoldMeta.textContent = `Kaynak: ${sourceLabel}`;
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
  document.body.classList.toggle("loan-rates-open", loanRatesOpen);
  document.body.classList.toggle("subpage-open", bankDetailOpen || loanRatesOpen || calculationOpen || investmentOpen);
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
    ui.needInstallmentAmount,
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

function revealLoanCalculator(loanType) {
  if (!ui.needLoanCalculator && !ui.depositCalculator && !ui.compoundCalculator && !ui.realCalculator) {
    return;
  }

  const resolvedLoanType = LOAN_TYPE_CONFIG[loanType] ? loanType : "need";
  if (ui.calculationPage) {
    ui.calculationPage.dataset.loanType = resolvedLoanType;
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
      ui.depositCalculator.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  if (resolvedLoanType === "compound") {
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
      ui.compoundCalculator.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  if (resolvedLoanType === "real") {
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
      ui.realCalculator.scrollIntoView({ behavior: "smooth", block: "start" });
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

  applyLoanTypeDefaults(typeConfig);
  ui.needLoanCalculator.classList.remove("hidden");
  renderNeedLoanTable(false);
  renderNeedLoanByInstallment(false);
  ui.needLoanCalculator.scrollIntoView({ behavior: "smooth", block: "start" });
}

function applyLoanTypeDefaults(typeConfig) {
  if (!typeConfig) {
    return;
  }

  if (ui.needPrincipal) {
    ui.needPrincipal.value = formatAmountInput(String(typeConfig.defaultPrincipal));
  }
  if (ui.needInstallmentAmount) {
    ui.needInstallmentAmount.value = formatAmountInput(String(typeConfig.defaultInstallment));
  }
  if (ui.needRate) {
    ui.needRate.value = typeConfig.defaultRate.toFixed(2);
  }
  if (ui.needInstallmentRateInput) {
    ui.needInstallmentRateInput.value = typeConfig.defaultRate.toFixed(2);
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
    ui.depositPrincipal.value = formatAmountInput(ui.depositPrincipal.value || "100000");
  }
  if (ui.depositTermDays && !ui.depositTermDays.value) {
    ui.depositTermDays.value = "32";
  }
  if (ui.depositRate && !ui.depositRate.value) {
    ui.depositRate.value = "43.50";
  }
  if (ui.depositCalcResult) {
    ui.depositCalcResult.classList.add("hidden");
  }
}

function applyCompoundDefaults() {
  if (ui.compoundPrincipal) {
    ui.compoundPrincipal.value = formatAmountInput(ui.compoundPrincipal.value || "100000");
  }
  if (ui.compoundFrequency && !ui.compoundFrequency.value) {
    ui.compoundFrequency.value = "monthly";
  }
  if (ui.compoundRate && !ui.compoundRate.value) {
    ui.compoundRate.value = "43.50";
  }
  if (ui.compoundRateType && !ui.compoundRateType.value) {
    ui.compoundRateType.value = "annual";
  }
  if (ui.compoundTerm && !ui.compoundTerm.value) {
    ui.compoundTerm.value = "365";
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
    ui.realInitialAmount.value = formatAmountInput(ui.realInitialAmount.value || "81750");
  }
  if (ui.realFinalAmount) {
    ui.realFinalAmount.value = formatAmountInput(ui.realFinalAmount.value || "109251");
  }
  if (ui.realInflationRate && !ui.realInflationRate.value) {
    ui.realInflationRate.value = "38.00";
  }
  if (ui.realBuyDate && !ui.realBuyDate.value) {
    ui.realBuyDate.value = "2026-01-01";
  }
  if (ui.realSellDate && !ui.realSellDate.value) {
    ui.realSellDate.value = "2026-03-01";
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

  if (
    !Number.isFinite(principal) ||
    principal <= 0 ||
    !Number.isFinite(termMonths) ||
    termMonths <= 0 ||
    !Number.isFinite(monthlyRate) ||
    monthlyRate < 0
  ) {
    alert("Lütfen geçerli bir kredi tutarı, vade ve faiz oranı gir.");
    return;
  }

  const monthlyPayment = calculateInstallment(principal, monthlyRate, termMonths);
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;

  ui.needCalcMonthly.textContent = formatTry(monthlyPayment);
  ui.needCalcTotal.textContent = formatTry(totalPayment);
  ui.needCalcInterest.textContent = formatTry(totalInterest);
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

  if (
    !Number.isFinite(installmentAmount) ||
    installmentAmount <= 0 ||
    !Number.isFinite(termMonths) ||
    termMonths <= 0 ||
    !Number.isFinite(monthlyRate) ||
    monthlyRate < 0
  ) {
    alert("Lütfen geçerli bir taksit tutarı, vade ve faiz oranı gir.");
    return;
  }

  const estimatedPrincipal = calculatePrincipalFromInstallment(installmentAmount, monthlyRate, termMonths);
  const totalPayment = installmentAmount * termMonths;
  const totalInterest = totalPayment - estimatedPrincipal;

  ui.needInstallmentPrincipal.textContent = formatTry(estimatedPrincipal);
  ui.needInstallmentTotal.textContent = formatTry(totalPayment);
  ui.needInstallmentInterest.textContent = formatTry(totalInterest);
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
          ["Aylık Taksit", `${formatTry(monthlyPayment)} TL`],
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
    return 0.15;
  }
  if (termDays <= 365) {
    return 0.12;
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
