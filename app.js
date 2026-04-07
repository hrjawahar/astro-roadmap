const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const PLANETS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
const STORAGE_KEY = "d1d9-life-pattern-inputs-v1";
const HISTORY_KEY = "d1d9-life-pattern-history-v1";

const REFERENCE_SECTIONS = [
  {
    title: "Core principles",
    lines: [
      "D1 shows external life events and visible promise.",
      "D9 shows maturity, durability, and how outcomes settle over time.",
      "Strong D1 + Strong D9 = stable result.",
      "Strong D1 + weak D9 = early promise but later inconsistency.",
      "Weak D1 + strong D9 = delayed but improving result.",
      "Weak D1 + weak D9 = repeated vulnerability unless supported elsewhere."
    ]
  },
  {
    title: "Foundational checks",
    lines: [
      "Start with Lagna and Lagna lord in D1 and D9.",
      "Read Moon before domain judgment because mental resilience modifies outcomes.",
      "House lord usually carries more weight than occupant.",
      "D9 has the final say on sustainability in marriage, long-term identity, and durability of results."
    ]
  },
  {
    title: "House quick reference",
    lines: [
      "1 self and identity",
      "2 wealth and family",
      "5 romance, intelligence, children",
      "6 disease, service, conflict",
      "7 marriage and partnerships",
      "8 secrets, transformation, vulnerability and longevity of bond",
      "10 career and reputation",
      "11 gains and networks",
      "12 loss, bed life, withdrawal, restraint"
    ]
  },
  {
    title: "Planet karakas",
    lines: [
      "Sun = identity, authority, recognition",
      "Moon = emotions, mind, habits",
      "Mars = drive, conflict, courage",
      "Mercury = analysis, speech, trade",
      "Jupiter = wisdom, prosperity, expansion",
      "Venus = love, harmony, pleasure",
      "Saturn = delay, karma, responsibility",
      "Rahu = obsession, experimentation, material hunger",
      "Ketu = detachment, withdrawal, insight"
    ]
  },
  {
    title: "Interpretation workflow",
    lines: [
      "1. Validate D1 and D9 input.",
      "2. Read Lagna and Moon.",
      "3. Read domain house lord, occupants, and main afflictions or support.",
      "4. Compare D1 promise with D9 sustainability.",
      "5. Resolve contradictions carefully instead of forcing a single extreme conclusion.",
      "6. Generate verdict and show the triggered reasoning inside each domain card."
    ]
  }
];

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const validationBox = document.getElementById("validationBox");
const summaryBox = document.getElementById("summaryBox");
const domainCards = document.getElementById("domainCards");
const quickVerdictGrid = document.getElementById("quickVerdictGrid");
const comparisonTableWrap = document.getElementById("comparisonTableWrap");
const analyzeBtn = document.getElementById("analyzeBtn");
const downloadBtn = document.getElementById("downloadReportBtn");
const resetBtn = document.getElementById("resetBtn");

function initSelect(id) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = "";
  SIGNS.forEach((sign) => {
    const opt = document.createElement("option");
    opt.value = sign;
    opt.textContent = sign;
    select.appendChild(opt);
  });
  select.value = "Aries";
}

function createGrid(containerId, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  for (let house = 1; house <= 12; house += 1) {
    const box = document.createElement("div");
    box.className = "house-box";
    box.innerHTML = `
      <div><strong>House ${house}</strong></div>
      <label for="${prefix}-house-${house}">Planets (comma separated)</label>
      <textarea id="${prefix}-house-${house}" placeholder="e.g. Venus, Mars"></textarea>
    `;
    container.appendChild(box);
  }
}

function initReferenceGuide() {
  const wrap = document.getElementById("referenceGuide");
  const template = document.getElementById("accordionTemplate");
  if (!wrap || !template) return;

  wrap.innerHTML = "";
  REFERENCE_SECTIONS.forEach((section) => {
    const node = template.content.cloneNode(true);
    const summary = node.querySelector("summary");
    const content = node.querySelector(".accordion-content");
    if (summary) summary.textContent = section.title;
    if (content) {
      content.innerHTML = `<ul>${section.lines.map((line) => `<li>${line}</li>`).join("")}</ul>`;
    }
    wrap.appendChild(node);
  });
}

function capitalize(text) {
  if (!text) return "";
  const clean = text.toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function getHouseInput(prefix) {
  const houses = {};
  for (let house = 1; house <= 12; house += 1) {
    const el = document.getElementById(`${prefix}-house-${house}`);
    const raw = el ? el.value.trim() : "";
    const planets = raw
      ? raw.split(",").map((item) => capitalize(item.trim())).filter(Boolean)
      : [];
    houses[house] = planets;
  }
  return houses;
}

function validateChart(chartName, lagna, houses) {
  const errors = [];
  const planetCounts = Object.fromEntries(PLANETS.map((p) => [p, 0]));

  Object.entries(houses).forEach(([house, planets]) => {
    planets.forEach((planet) => {
      if (!PLANETS.includes(planet)) {
        errors.push(`${chartName}: ${planet} in house ${house} is not a supported planet name.`);
      } else {
        planetCounts[planet] += 1;
      }
    });
  });

  PLANETS.forEach((planet) => {
    if (planetCounts[planet] === 0) {
      errors.push(`${chartName}: ${planet} is missing.`);
    }
    if (planetCounts[planet] > 1) {
      errors.push(`${chartName}: ${planet} appears ${planetCounts[planet]} times.`);
    }
  });

  if (!lagna) {
    errors.push(`${chartName}: Lagna sign missing.`);
  }

  return { errors, planetCounts };
}

function renderValidation(errors) {
  if (!validationBox) return;

  if (!errors.length) {
    validationBox.innerHTML = `<span class="good">Validation passed.</span> D1 and D9 look structurally complete.`;
    return;
  }

  validationBox.innerHTML = `
    <div class="bad"><strong>Validation failed:</strong></div>
    <ul>${errors.map((err) => `<li>${err}</li>`).join("")}</ul>
  `;
}

function buildPayload() {
  const d1Lagna = document.getElementById("d1Lagna")?.value || "";
  const d9Lagna = document.getElementById("d9Lagna")?.value || "";
  const d1Houses = getHouseInput("d1");
  const d9Houses = getHouseInput("d9");

  return {
    d1: { lagnaSign: d1Lagna, houses: d1Houses },
    d9: { lagnaSign: d9Lagna, houses: d9Houses },
    meta: { source: "manual-entry-browser-app", version: "clean-rewrite-v1" }
  };
}

function normalizeVerdict(text) {
  if (!text) return "";
  return text
    .replace(/EMA Risk/gi, "Restraint")
    .replace(/\bMixed progression\b/gi, "Shifting pattern")
    .replace(/\bMixed\b/gi, "Developing");
}

function saveInputsToLocal() {
  const payload = {
    nativeName: document.getElementById("nativeName")?.value || "",
    d1Lagna: document.getElementById("d1Lagna")?.value || "",
    d9Lagna: document.getElementById("d9Lagna")?.value || "",
    d1: {},
    d9: {}
  };

  for (let house = 1; house <= 12; house += 1) {
    payload.d1[house] = document.getElementById(`d1-house-${house}`)?.value || "";
    payload.d9[house] = document.getElementById(`d9-house-${house}`)?.value || "";
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreInputsFromLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);

    const nativeName = document.getElementById("nativeName");
    const d1Lagna = document.getElementById("d1Lagna");
    const d9Lagna = document.getElementById("d9Lagna");

    if (nativeName) nativeName.value = saved.nativeName || "";
    if (d1Lagna) d1Lagna.value = saved.d1Lagna || "Aries";
    if (d9Lagna) d9Lagna.value = saved.d9Lagna || "Aries";

    for (let house = 1; house <= 12; house += 1) {
      const d1 = document.getElementById(`d1-house-${house}`);
      const d9 = document.getElementById(`d9-house-${house}`);
      if (d1) d1.value = saved.d1?.[house] || "";
      if (d9) d9.value = saved.d9?.[house] || "";
    }
  } catch (error) {
    console.error("Failed to restore saved inputs", error);
  }
}
function getSavedHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCurrentEntryToHistory() {
  const nativeName = document.getElementById("nativeName")?.value || "Unnamed";

  const entry = {
    id: Date.now().toString(),
    name: nativeName,
    savedAt: new Date().toISOString(),
    d1Lagna: document.getElementById("d1Lagna")?.value || "",
    d9Lagna: document.getElementById("d9Lagna")?.value || "",
    d1: {},
    d9: {}
  };

  for (let i = 1; i <= 12; i++) {
    entry.d1[i] = document.getElementById(`d1-${i}`)?.value || "";
    entry.d9[i] = document.getElementById(`d9-${i}`)?.value || "";
  }

  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  history.unshift(entry);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}
function loadHistoryEntry(id) {
  const history = getSavedHistory();
  const item = history.find(entry => entry.id === id);
  if (!item) return;

  const nativeName = document.getElementById("nativeName");
  const d1Lagna = document.getElementById("d1Lagna");
  const d9Lagna = document.getElementById("d9Lagna");

  if (nativeName) nativeName.value = item.name || "";
  if (d1Lagna) d1Lagna.value = item.d1Lagna || "Aries";
  if (d9Lagna) d9Lagna.value = item.d9Lagna || "Aries";

  for (let house = 1; house <= 12; house += 1) {
    const d1 = document.getElementById(`d1-house-${house}`);
    const d9 = document.getElementById(`d9-house-${house}`);
    if (d1) d1.value = item.d1?.[house] || "";
    if (d9) d9.value = item.d9?.[house] || "";
  }

  saveInputsToLocal();
}

function deleteHistoryEntry(id) {
  const history = getSavedHistory().filter(entry => entry.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
console.log("SAVED", history);}

function renderHistory() {
  const historyBox = document.getElementById("historyBox");
  if (!historyBox) return;

  const history = getSavedHistory();

  if (!history.length) {
    historyBox.innerHTML = "No saved entries yet.";
    return;
  }

  historyBox.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-main">
        <div class="history-name">${item.name}</div>
        <div class="history-meta">Saved: ${new Date(item.savedAt).toLocaleString()}</div>
        <div class="history-meta">D1: ${item.d1Lagna} | D9: ${item.d9Lagna}</div>
      </div>
      <div class="history-actions">
        <button class="secondary history-load-btn" data-load-id="${item.id}">Load</button>
        <button class="danger history-delete-btn" data-delete-id="${item.id}">Delete</button>
      </div>
    </div>
  `).join("");

  historyBox.querySelectorAll("[data-load-id]").forEach(btn => {
    btn.addEventListener("click", () => loadHistoryEntry(btn.dataset.loadId));
  });

  historyBox.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => deleteHistoryEntry(btn.dataset.deleteId));
  });
}
function bindAutoSave() {
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("input", saveInputsToLocal);
    el.addEventListener("change", saveInputsToLocal);
  });
}

async function analyze() {
  const payload = buildPayload();
  const d1Validation = validateChart("D1", payload.d1.lagnaSign, payload.d1.houses);
  const d9Validation = validateChart("D9", payload.d9.lagnaSign, payload.d9.houses);
  const errors = [...d1Validation.errors, ...d9Validation.errors];

  renderValidation(errors);
  if (errors.length) return;

  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
  }

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Backend is not returning JSON. Check /functions/api/analyze.js deployment.");
    }

    if (!res.ok) {
      throw new Error(data.error || "Analysis failed");
    }

    renderResult(data);
    switchTab("insightsTab");
  } catch (error) {
    if (validationBox) {
      validationBox.innerHTML = `<span class="bad">${error.message}</span>`;
    }
  } finally {
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Generate Insights";
    }
  }
}

function renderResult(data) {
  const domains = (data.domains || []).map((domain) => ({
    ...domain,
    title: normalizeVerdict(domain.title),
    verdict: normalizeVerdict(domain.verdict)
  }));

  const summary = data.summary || {};
  if (summaryBox) {
    summaryBox.innerHTML = `
      <p><strong>Overall pattern:</strong> ${summary.overallPattern || "-"}</p>
      <p><strong>Early-life leaning:</strong> ${summary.earlyLife || "-"}</p>
      <p><strong>Later-life leaning:</strong> ${summary.laterLife || "-"}</p>
      <p><strong>Generated:</strong> ${data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "-"}</p>
    `;
  }

  renderQuickVerdict(domains);
  renderComparisonTable(domains);
  renderDomainCards(domains);

  window.__lastReport = {
    ...data,
    domains
  };

  if (downloadBtn) {
    downloadBtn.disabled = false;
  }
}

function renderQuickVerdict(domains) {
  if (!quickVerdictGrid) return;

  quickVerdictGrid.innerHTML = domains.map((domain) => `
    <div class="verdict-card">
      <h3>${domain.title}</h3>
      <div class="verdict-value">${domain.verdict}</div>
    </div>
  `).join("");
}

function deriveTrend(domain) {
  if (domain.d1Strength === "Strong" && domain.d9Strength === "Strong") return "Stable";
  if (domain.d1Strength === "Strong" && (domain.d9Strength === "Developing" || domain.d9Strength === "Weak")) {
    return "Early strength, later fluctuation";
  }
  if ((domain.d1Strength === "Developing" || domain.d1Strength === "Weak") && domain.d9Strength === "Strong") {
    return "Improves later";
  }
  if (domain.d1Strength === "Weak" && domain.d9Strength === "Weak") return "Persistent challenge";
  return "Shifting pattern";
}

function renderComparisonTable(domains) {
  if (!comparisonTableWrap) return;

  comparisonTableWrap.className = "comparison-table-wrap";
  comparisonTableWrap.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Domain</th>
          <th>D1</th>
          <th>D9</th>
          <th>Trend</th>
          <th>Final Verdict</th>
        </tr>
      </thead>
      <tbody>
        ${domains.map((domain) => `
          <tr>
            <td>${domain.title}</td>
            <td>${domain.d1Strength || "-"}</td>
            <td>${domain.d9Strength || "-"}</td>
            <td>${deriveTrend(domain)}</td>
            <td>${domain.verdict || "-"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function statusClass(verdict) {
  const key = (verdict || "").toLowerCase();
  if (key.includes("stable") || key.includes("strong")) return "status-stable";
  if (
    key.includes("developing") ||
    key.includes("moderate") ||
    key.includes("temporary") ||
    key.includes("delayed") ||
    key.includes("improves")
  ) {
    return "status-developing";
  }
  return "status-vulnerable";
}

function renderDomainCards(domains) {
  if (!domainCards) return;

  domainCards.innerHTML = domains.map((domain) => `
    <article class="domain-card">
      <div class="domain-group-tag">${deriveTrend(domain)}</div>
      <div class="section-head compact">
        <h2>${domain.title}</h2>
        <span class="status-badge ${statusClass(domain.verdict)}">${domain.verdict}</span>
      </div>
      <div class="score-row"><strong>D1:</strong> ${domain.d1Strength || "-"}</div>
      <div class="score-row"><strong>D9:</strong> ${domain.d9Strength || "-"}</div>
      <div class="score-row"><strong>Astrology standpoint:</strong> ${domain.factorOverview || "-"}</div>
      <div class="score-row"><strong>Flag logic:</strong> ${domain.flagLogic || "-"}</div>
      <div class="score-row"><strong>Flags:</strong> ${(domain.flags && domain.flags.length) ? domain.flags.join(", ") : "None"}</div>
      <div class="score-row"><strong>Reading:</strong></div>
      <ul class="status-list">${(domain.reasons || []).map((r) => `<li>${r}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function buildWordReport(data) {
  const nativeName = document.getElementById("nativeName")?.value || "Unnamed Native";

  return `
  <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <title>D1-D9 Report</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.5; color: #222; }
      h1, h2, h3 { color: #113d6d; }
      table { border-collapse: collapse; width: 100%; margin: 12px 0; }
      th, td { border: 1px solid #999; padding: 8px; text-align: left; vertical-align: top; }
      .section { margin-bottom: 20px; }
    </style>
  </head>
  <body>
    <h1>D1–D9 Life Pattern Analyzer Report</h1>
    <p><strong>Native:</strong> ${nativeName}</p>
    <p><strong>Generated:</strong> ${data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "-"}</p>

    <div class="section">
      <h2>Summary</h2>
      <p><strong>Overall pattern:</strong> ${data.summary?.overallPattern || "-"}</p>
      <p><strong>Early-life leaning:</strong> ${data.summary?.earlyLife || "-"}</p>
      <p><strong>Later-life leaning:</strong> ${data.summary?.laterLife || "-"}</p>
    </div>

    <div class="section">
      <h2>D1–D9 Comparison</h2>
      <table>
        <tr>
          <th>Domain</th>
          <th>D1</th>
          <th>D9</th>
          <th>Trend</th>
          <th>Final Verdict</th>
        </tr>
        ${(data.domains || []).map((domain) => `
          <tr>
            <td>${domain.title || "-"}</td>
            <td>${domain.d1Strength || "-"}</td>
            <td>${domain.d9Strength || "-"}</td>
            <td>${deriveTrend(domain)}</td>
            <td>${domain.verdict || "-"}</td>
          </tr>
        `).join("")}
      </table>
    </div>

    <div class="section">
      <h2>Domain Insights</h2>
      ${(data.domains || []).map((domain) => `
        <h3>${domain.title || "-"}</h3>
        <p><strong>Verdict:</strong> ${domain.verdict || "-"}</p>
        <p><strong>D1 Strength:</strong> ${domain.d1Strength || "-"}</p>
        <p><strong>D9 Strength:</strong> ${domain.d9Strength || "-"}</p>
        <p><strong>Astrology standpoint:</strong> ${domain.factorOverview || "-"}</p>
        <p><strong>Flag logic:</strong> ${domain.flagLogic || "-"}</p>
        <p><strong>Flags:</strong> ${(domain.flags && domain.flags.length) ? domain.flags.join(", ") : "None"}</p>
        <ul>
          ${(domain.reasons || []).map((r) => `<li>${r}</li>`).join("")}
        </ul>
      `).join("")}
    </div>
  </body>
  </html>`;
}

function switchTab(tabId) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabId));
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === tabId));
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

if (analyzeBtn) {
  analyzeBtn.addEventListener("click", analyze);
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });
}

if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    if (!window.__lastReport) return;

    const html = buildWordReport(window.__lastReport);
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "d1-d9-analysis-report.doc";
    a.click();

    URL.revokeObjectURL(url);
  });
}

initSelect("d1Lagna");
initSelect("d9Lagna");
createGrid("d1Grid", "d1");
createGrid("d9Grid", "d9");
initReferenceGuide();
restoreInputsFromLocal();
bindAutoSave();
renderHistory();

const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    console.log("SAVE CLICKED");   // <-- add this
    saveInputsToLocal();
    saveCurrentEntryToHistory();
  });
}
