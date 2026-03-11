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
  authToggle: document.getElementById("authToggle"),
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
  resultView: document.getElementById("resultView"),
  questionTitle: document.getElementById("questionTitle"),
  questionMeta: document.getElementById("questionMeta"),
  answerArea: document.getElementById("answerArea"),
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
}

async function loadQuestions() {
  const apiBase = normalizeBaseUrl(ui.apiBase.value);

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
  ui.resultView.classList.add("hidden");
  ui.questionView.classList.add("hidden");
  ui.consentView.classList.remove("hidden");

  document.body.classList.remove("question-format");
  ui.stepLabel.textContent = "KVKK";
  ui.stepCounter.textContent = "Adım 1 / 1";
  ui.progressFill.style.width = "0%";

  ui.prevButton.disabled = true;
  ui.prevButton.classList.add("hidden");
  ui.nextButton.disabled = !ui.consentCheckbox.checked;
  ui.nextButton.classList.remove("hidden");
  ui.nextButton.textContent = "Onayı ver ve başla";
}

function renderQuestion() {
  closeAuthPopover();
  ui.resultView.classList.add("hidden");
  ui.consentView.classList.add("hidden");
  ui.questionView.classList.remove("hidden");

  document.body.classList.add("question-format");
  const question = state.questions[state.currentIndex];
  const total = state.questions.length;
  const step = state.currentIndex + 1;
  const progress = total === 0 ? 0 : Math.round((step / total) * 100);

  ui.stepLabel.textContent = SECTION_LABELS[question.section] || "Finans";
  ui.stepCounter.textContent = `Soru ${step} / ${total}`;
  ui.progressFill.style.width = `${progress}%`;

  ui.questionTitle.textContent = question.prompt;
  ui.questionMeta.textContent = metaTextForQuestion(question);

  ui.answerArea.innerHTML = "";
  renderInputForQuestion(question, state.answers[question.id]);

  ui.prevButton.classList.add("hidden");
  ui.nextButton.classList.remove("hidden");
  ui.nextButton.textContent = step === total ? "Sonucu göster" : "Devam Et";
  updatePrimaryActionState();
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
    const apiBase = normalizeBaseUrl(ui.apiBase.value);
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
    const apiBase = normalizeBaseUrl(ui.apiBase.value);
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
    const apiBase = normalizeBaseUrl(ui.apiBase.value);
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
  const apiBase = normalizeBaseUrl(ui.apiBase.value);
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
    return "Ben...";
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
    return;
  }

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
