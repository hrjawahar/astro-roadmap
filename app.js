
const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const PLANETS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];

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

const signLord = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const validationBox = document.getElementById('validationBox');
const summaryBox = document.getElementById('summaryBox');
const domainCards = document.getElementById('domainCards');
const quickVerdictGrid = document.getElementById('quickVerdictGrid');
const comparisonTableWrap = document.getElementById('comparisonTableWrap');
const analyzeBtn = document.getElementById('analyzeBtn');
const downloadBtn = document.getElementById('downloadReportBtn');
const resetBtn = document.getElementById('resetBtn');

function initSelect(id) {
  const select = document.getElementById(id);
  SIGNS.forEach(sign => {
    const opt = document.createElement('option');
    opt.value = sign;
    opt.textContent = sign;
    select.appendChild(opt);
  });
  select.value = 'Aries';
}

function createGrid(containerId, prefix) {
  const container = document.getElementById(containerId);
  for (let house = 1; house <= 12; house += 1) {
    const box = document.createElement('div');
    box.className = 'house-box';
    box.innerHTML = `
      <div><strong>House ${house}</strong></div>
      <label for="${prefix}-house-${house}">Planets (comma separated)</label>
      <textarea id="${prefix}-house-${house}" placeholder="e.g. Venus, Mars"></textarea>
    `;
    container.appendChild(box);
  }
}

function initReferenceGuide() {
  const wrap = document.getElementById('referenceGuide');
  const template = document.getElementById('accordionTemplate');
  wrap.innerHTML = '';

  REFERENCE_SECTIONS.forEach(section => {
    const node = template.content.cloneNode(true);
    node.querySelector('summary').textContent = section.title;
    node.querySelector('.accordion-content').innerHTML = `<ul>${section.lines.map(line => `<li>${line}</li>`).join('')}</ul>`;
    wrap.appendChild(node);
  });
}

function capitalize(text) {
  if (!text) return '';
  const clean = text.toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function getHouseInput(prefix) {
  const houses = {};
  for (let house = 1; house <= 12; house += 1) {
    const raw = document.getElementById(`${prefix}-house-${house}`).value.trim();
    const planets = raw ? raw.split(',').map(item => capitalize(item.trim())).filter(Boolean) : [];
    houses[house] = planets;
  }
  return houses;
}

function validateChart(chartName, lagna, houses) {
  const errors = [];
  const planetCounts = Object.fromEntries(PLANETS.map(p => [p, 0]));
  Object.entries(houses).forEach(([house, planets]) => {
    planets.forEach(p => {
      if (!PLANETS.includes(p)) {
        errors.push(`${chartName}: ${p} in house ${house} is not a supported planet name.`);
      } else {
        planetCounts[p] += 1;
      }
    });
  });
  PLANETS.forEach(p => {
    if (planetCounts[p] === 0) errors.push(`${chartName}: ${p} is missing.`);
    if (planetCounts[p] > 1) errors.push(`${chartName}: ${p} appears ${planetCounts[p]} times.`);
  });
  if (!lagna) errors.push(`${chartName}: Lagna sign missing.`);
  return { errors, planetCounts };
}

function renderValidation(errors) {
  if (!errors.length) {
    validationBox.innerHTML = `<span class="good">Validation passed.</span> D1 and D9 look structurally complete.`;
    return;
  }
  validationBox.innerHTML = `<div class="bad"><strong>Validation failed:</strong></div><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`;
}

function buildPayload() {
  const d1Lagna = document.getElementById('d1Lagna').value;
  const d9Lagna = document.getElementById('d9Lagna').value;
  const d1Houses = getHouseInput('d1');
  const d9Houses = getHouseInput('d9');
  return {
    d1: { lagnaSign: d1Lagna, houses: d1Houses },
    d9: { lagnaSign: d9Lagna, houses: d9Houses },
    meta: { source: 'manual-entry-browser-app', version: 'v2-layout-preserved' }
  };
}

function normalizeVerdict(text) {
  if (!text) return '';
  return text
    .replace(/EMA Risk/gi, 'Restraint')
    .replace(/\bMixed\b/gi, 'Developing')
    .replace(/\bMixed progression\b/gi, 'Shifting pattern');
}

async function analyze() {
  const payload = buildPayload();
  const d1Validation = validateChart('D1', payload.d1.lagnaSign, payload.d1.houses);
  const d9Validation = validateChart('D9', payload.d9.lagnaSign, payload.d9.houses);
  const errors = [...d1Validation.errors, ...d9Validation.errors];
  renderValidation(errors);
  if (errors.length) return;

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Backend is not returning JSON. Check /functions/api/analyze.js deployment.');
    }

    if (!res.ok) throw new Error(data.error || 'Analysis failed');

    renderResult(data);
    switchTab('insightsTab');
  } catch (error) {
    validationBox.innerHTML = `<span class="bad">${error.message}</span>`;
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Generate Insights';
  }
}

function renderResult(data) {
  const domains = (data.domains || []).map(domain => ({
    ...domain,
    title: normalizeVerdict(domain.title),
    verdict: normalizeVerdict(domain.verdict)
  }));

  const summary = data.summary || {};
  summaryBox.innerHTML = `
    <p><strong>Overall pattern:</strong> ${summary.overallPattern || '-'}</p>
    <p><strong>Early-life leaning:</strong> ${summary.earlyLife || '-'}</p>
    <p><strong>Later-life leaning:</strong> ${summary.laterLife || '-'}</p>
    <p><strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleString()}</p>
  `;

  renderQuickVerdict(domains);
  renderComparisonTable(domains);
  renderDomainCards(domains);

  window.__lastReport = { ...data, domains };
  downloadBtn.disabled = false;
}

function renderQuickVerdict(domains) {
  quickVerdictGrid.innerHTML = domains.map(domain => `
    <div class="verdict-card">
      <h3>${domain.title}</h3>
      <div class="verdict-value">${domain.verdict}</div>
    </div>
  `).join('');
}

function renderComparisonTable(domains) {
  comparisonTableWrap.className = 'comparison-table-wrap';
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
        ${domains.map(domain => `
          <tr>
            <td>${domain.title}</td>
            <td>${domain.d1Strength}</td>
            <td>${domain.d9Strength}</td>
            <td>${deriveTrend(domain)}</td>
            <td>${domain.verdict}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function deriveTrend(domain) {
  if (domain.d1Strength === 'Strong' && domain.d9Strength === 'Strong') return 'Stable';
  if (domain.d1Strength === 'Strong' && (domain.d9Strength === 'Developing' || domain.d9Strength === 'Weak')) return 'Early strength, later fluctuation';
  if ((domain.d1Strength === 'Developing' || domain.d1Strength === 'Weak') && domain.d9Strength === 'Strong') return 'Improves later';
  if (domain.d1Strength === 'Weak' && domain.d9Strength === 'Weak') return 'Persistent challenge';
  return 'Shifting pattern';
}

function statusClass(verdict) {
  const key = (verdict || '').toLowerCase();
  if (key.includes('stable') || key.includes('strong')) return 'status-stable';
  if (key.includes('developing') || key.includes('moderate') || key.includes('temporary') || key.includes('delayed')) return 'status-developing';
  return 'status-vulnerable';
}

function renderDomainCards(domains) {
  domainCards.innerHTML = domains.map(domain => `
    <article class="domain-card">
      <div class="domain-group-tag">${deriveTrend(domain)}</div>
      <div class="section-head compact">
        <h2>${domain.title}</h2>
        <span class="status-badge ${statusClass(domain.verdict)}">${domain.verdict}</span>
      </div>
      <div class="score-row"><strong>D1:</strong> ${domain.d1Strength}</div>
      <div class="score-row"><strong>D9:</strong> ${domain.d9Strength}</div>
      <div class="score-row"><strong>Astrology standpoint:</strong> ${domain.factorOverview || '-'}</div>
      <div class="score-row"><strong>Flag logic:</strong> ${domain.flagLogic || '-'}</div>
      <div class="score-row"><strong>Flags:</strong> ${(domain.flags && domain.flags.length) ? domain.flags.join(', ') : 'None'}</div>
      <div class="score-row"><strong>Reading:</strong></div>
      <ul class="status-list">${(domain.reasons || []).map(r => `<li>${r}</li>`).join('')}</ul>
    </article>
  `).join('');
}

function switchTab(tabId) {
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabId));
  panels.forEach(panel => panel.classList.toggle('active', panel.id === tabId));
}

tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
analyzeBtn.addEventListener('click', analyze);
resetBtn.addEventListener('click', () => window.location.reload());

downloadBtn.addEventListener('click', () => {
  if (!window.__lastReport) return;
  const report = buildDownloadText(window.__lastReport);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'd1-d9-analysis-report.txt';
  a.click();
  URL.revokeObjectURL(url);
});

function buildDownloadText(data) {
  const nativeName = document.getElementById("nativeName")?.value || "Unnamed Native";
  const lines = [];
  lines.push(`Native: ${nativeName}`);
  lines.push('D1-D9 LIFE PATTERN ANALYZER REPORT');
  lines.push('');
  lines.push(`Generated At: ${new Date(data.generatedAt).toLocaleString()}`);
  lines.push(`Overall Pattern: ${data.summary.overallPattern}`);
  lines.push(`Early-Life Leaning: ${data.summary.earlyLife}`);
  lines.push(`Later-Life Leaning: ${data.summary.laterLife}`);
  lines.push('');
  lines.push('DOMAIN INSIGHTS');

  data.domains.forEach(domain => {
    lines.push('');
    lines.push(domain.title.toUpperCase());
    lines.push(`Verdict: ${domain.verdict}`);
    lines.push(`D1 Strength: ${domain.d1Strength}`);
    lines.push(`D9 Strength: ${domain.d9Strength}`);
    lines.push(`Astrology standpoint: ${domain.factorOverview || ''}`);
    lines.push(`Flag logic: ${domain.flagLogic || ''}`);
    lines.push(`Flags: ${domain.flags.join(', ') || 'None'}`);
    domain.reasons.forEach(reason => lines.push(`- ${reason}`));
  });

  return lines.join('\\n');
}

initSelect('d1Lagna');
initSelect('d9Lagna');
createGrid('d1Grid', 'd1');
createGrid('d9Grid', 'd9');
initReferenceGuide();
