const aparelhos = [
  { id: "esteira", nome: "Esteira", icon: "🏃", categorias: ["1km", "5km", "10min Max"] }
];

// Adicione runs aqui quando necessário: { pos, nome, tempo, data, plataforma }
const rankings = {
  esteira: []
};

const tecnicas = {
  esteira: []
};

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

function buildLeaderboard(rows) {
  return `
    <div class="leaderboard">
      <div class="lb-header">
        <span>Pos</span><span>Runner</span><span>Tempo</span><span>Data</span><span>Plataforma</span>
      </div>
      ${rows.map(r => `
        <div class="lb-row">
          <span class="rank ${rankClass(r.pos)}">${rankEmoji(r.pos)}</span>
          <span class="runner-name">${r.nome}</span>
          <span class="time">${r.tempo}</span>
          <span class="date">${r.data}</span>
          <span class="platform">${r.plataforma}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function buildTecnicas(lista) {
  return lista.map(t => `
    <div class="tecnica-card">
      <h3>${t.nome}</h3>
      <p>${t.desc}</p>
      <span class="tecnica-tag">${t.tag}</span>
    </div>
  `).join("");
}

// Tabs
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
window.buildLeaderboard = buildLeaderboard;
window.buildTecnicas = buildTecnicas;
window.initTabs = initTabs;
