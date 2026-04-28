// ═══════════════════════════════════════════════════════════════
//  APARELHOS — adicione novos aparelhos aqui
//  Campos: id (sem espaços), nome, icon (emoji), categorias
// ═══════════════════════════════════════════════════════════════
const aparelhos = [
  { id: "esteira", nome: "Esteira", icon: "🏃", categorias: ["1km", "5km", "10min Max"] }
];

// ═══════════════════════════════════════════════════════════════
//  RANKINGS — adicione runs aprovadas aqui
//  Campos: runner (nome exato), tempo, categoria, data (DD/MM/AAAA)
//
//  Exemplo:
//  esteira: [
//    { runner: "NomeDoJogador", tempo: "3:42.10", categoria: "1km", data: "01/06/2025" },
//  ]
// ═══════════════════════════════════════════════════════════════
const rankings = {
  esteira: []
};

// ═══════════════════════════════════════════════════════════════
//  TÉCNICAS — adicione técnicas por aparelho aqui
//  Campos: nome, desc, tag
// ═══════════════════════════════════════════════════════════════
const tecnicas = {
  esteira: []
};

// ── Funções internas ──────────────────────────────────────────
function rankClass(pos) {
  if (pos === 1) return "gold";
  if (pos === 2) return "silver";
  if (pos === 3) return "bronze";
  return "";
}

function rankEmoji(pos) {
  if (pos === 1) return "🥇";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  return `#${pos}`;
}

function getRankingAparelho(id) {
  return (rankings[id] || []).map((r, i) => ({ ...r, pos: i + 1 }));
}

function buildLeaderboard(rows) {
  if (!rows.length) return `<div class="empty-lb">Nenhuma run ainda. Seja o primeiro! 🚀</div>`;
  return `
    <div class="leaderboard">
      <div class="lb-header">
        <span>Pos</span><span>Runner</span><span>Tempo</span><span>Categoria</span><span>Data</span>
      </div>
      ${rows.map(r => `
        <div class="lb-row">
          <span class="rank ${rankClass(r.pos)}">${rankEmoji(r.pos)}</span>
          <span class="runner-name">${r.runner}</span>
          <span class="time">${r.tempo}</span>
          <span class="platform">${r.categoria}</span>
          <span class="date">${r.data}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function buildTecnicas(lista) {
  if (!lista.length) return `<p style="color:var(--muted);padding:1rem">Nenhuma técnica documentada ainda.</p>`;
  return lista.map(t => `
    <div class="tecnica-card">
      <h3>${t.nome}</h3>
      <p>${t.desc}</p>
      <span class="tecnica-tag">${t.tag}</span>
    </div>
  `).join("");
}

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".tabs-container");
      parent.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      parent.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      parent.querySelector(`#${btn.dataset.tab}`).classList.add("active");
    });
  });
}

window.aparelhos = aparelhos;
window.rankings = rankings;
window.tecnicas = tecnicas;
window.getRankingAparelho = getRankingAparelho;
window.buildLeaderboard = buildLeaderboard;
window.buildTecnicas = buildTecnicas;
window.initTabs = initTabs;
