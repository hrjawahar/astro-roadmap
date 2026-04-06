
function replaceMixed(text){
return text ? text.replace(/mixed/gi,'Moderate / Needs Attention') : '';
}

function renderQuickVerdict(domains){
const grid=document.getElementById('quickVerdictGrid');
if(!domains) return;
grid.innerHTML=domains.map(d=>`
<div class="verdict-card">
<h3>${(d.title||'').replace('EMA','Restraint')}</h3>
<div>${replaceMixed(d.verdict)}</div>
</div>
`).join('');
}

function renderDomains(domains){
const wrap=document.getElementById('domainCards');
if(!domains) return;
wrap.innerHTML=domains.map(d=>`
<div class="card">
<h3>${(d.title||'').replace('EMA','Restraint')}</h3>
<p><b>Astrology View:</b> ${d.description||''}</p>
<p><b>Logic:</b> ${d.logic||''}</p>
<p><b>Status:</b> ${replaceMixed(d.verdict)}</p>
</div>
`).join('');
}

// main render hook
function renderResult(data){
renderQuickVerdict(data.domains);
renderDomains(data.domains);
}
