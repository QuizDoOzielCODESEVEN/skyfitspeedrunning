function hashSenha(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++)
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  return (hash >>> 0).toString(16);
}

function initMod() {
  const users = getUsers();
  if (!users.find(u => u.role === "mod")) {
    users.push({
      id: "mod_skyfit",
      username: "SkyFitMod",
      senha: hashSenha("SkyFit@Mod2025!"),
      role: "mod",
      criadoEm: new Date().toISOString()
    });
    saveUsers(users);
  }
}

function getUsers() { return JSON.parse(localStorage.getItem("sfsr_users") || "[]"); }
function saveUsers(u) { localStorage.setItem("sfsr_users", JSON.stringify(u)); }
function getSessao() { return JSON.parse(localStorage.getItem("sfsr_sessao") || "null"); }
function setSessao(user) {
  localStorage.setItem("sfsr_sessao", JSON.stringify({ id: user.id, username: user.username, role: user.role }));
}
function logout() {
  localStorage.removeItem("sfsr_sessao");
  window.location.href = getRootPath() + "index.html";
}
function getRootPath() {
  return location.pathname.includes("/aparelhos/") ? "../" : "";
}

function cadastrar(username, senha) {
  if (username.length < 3) return { ok: false, msg: "Nome de usuário muito curto (mín. 3 caracteres)." };
  if (senha.length < 6) return { ok: false, msg: "Senha muito curta (mín. 6 caracteres)." };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { ok: false, msg: "Nome de usuário só pode ter letras, números e _." };
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
    return { ok: false, msg: "Nome de usuário já está em uso." };
  const user = { id: "u_" + Date.now(), username, senha: hashSenha(senha), role: "runner", criadoEm: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  setSessao(user);
  return { ok: true };
}

function login(username, senha) {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.senha === hashSenha(senha));
  if (!user) return { ok: false, msg: "Usuário ou senha incorretos." };
  setSessao(user);
  return { ok: true, role: user.role };
}

// ── RUNS ──────────────────────────────────────────────────────────────────────
function getRuns() { return JSON.parse(localStorage.getItem("sfsr_runs") || "[]"); }
function saveRuns(r) { localStorage.setItem("sfsr_runs", JSON.stringify(r)); }

function submeterRun(aparelhoId, categoria, tempo, prova) {
  const sessao = getSessao();
  if (!sessao) return { ok: false, msg: "Você precisa estar logado." };
  const run = {
    id: "r_" + Date.now(), aparelhoId, categoria, tempo, prova,
    runner: sessao.username, runnerId: sessao.id,
    status: "pendente", criadoEm: new Date().toISOString()
  };
  const runs = getRuns();
  runs.push(run);
  saveRuns(runs);
  return { ok: true };
}

function aprovarRun(runId) {
  const runs = getRuns();
  const run = runs.find(r => r.id === runId);
  if (run) { run.status = "aprovada"; saveRuns(runs); }
}

function rejeitarRun(runId) {
  saveRuns(getRuns().filter(r => r.id !== runId));
}

function getRunsAprovadasPorAparelho(aparelhoId) {
  return getRuns()
    .filter(r => r.aparelhoId === aparelhoId && r.status === "aprovada")
    .sort((a, b) => a.tempo.localeCompare(b.tempo, undefined, { numeric: true }))
    .map((r, i) => ({ ...r, pos: i + 1 }));
}

// ── RANKINGS PROPOSTOS ────────────────────────────────────────────────────────
function getRankingsProposto() { return JSON.parse(localStorage.getItem("sfsr_rankings_prop") || "[]"); }
function saveRankingsProposto(r) { localStorage.setItem("sfsr_rankings_prop", JSON.stringify(r)); }

function proporRanking(nome, icon, categorias, descricao) {
  const sessao = getSessao();
  if (!sessao) return { ok: false, msg: "Você precisa estar logado." };
  if (!nome.trim()) return { ok: false, msg: "Nome é obrigatório." };
  if (!categorias.trim()) return { ok: false, msg: "Categorias são obrigatórias." };
  const lista = getRankingsProposto();
  lista.push({
    id: "rp_" + Date.now(),
    nome: nome.trim(),
    icon: icon.trim() || "🏅",
    categorias: categorias.split(",").map(c => c.trim()).filter(Boolean),
    descricao: descricao.trim(),
    autor: sessao.username,
    autorId: sessao.id,
    criadoEm: new Date().toISOString()
  });
  saveRankingsProposto(lista);
  return { ok: true };
}

function aprovarRankingProposto(id) {
  const lista = getRankingsProposto();
  const item = lista.find(r => r.id === id);
  if (!item) return;
  // Injeta no localStorage de aparelhos aprovados
  const aprovados = JSON.parse(localStorage.getItem("sfsr_aparelhos_extra") || "[]");
  aprovados.push({ id: "ap_" + Date.now(), nome: item.nome, icon: item.icon, categorias: item.categorias });
  localStorage.setItem("sfsr_aparelhos_extra", JSON.stringify(aprovados));
  saveRankingsProposto(lista.filter(r => r.id !== id));
}

function rejeitarRankingProposto(id) {
  saveRankingsProposto(getRankingsProposto().filter(r => r.id !== id));
}

function getAparelhosExtras() {
  return JSON.parse(localStorage.getItem("sfsr_aparelhos_extra") || "[]");
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function renderNav() {
  const sessao = getSessao();
  const root = getRootPath();
  const navEl = document.getElementById("nav-auth");
  if (!navEl) return;
  if (!sessao) {
    navEl.innerHTML = `
      <a href="${root}login.html">Entrar</a>
      <a href="${root}cadastro.html" style="background:var(--accent);color:#fff;border-radius:6px;padding:6px 14px">Cadastrar</a>`;
  } else {
    const modLink = sessao.role === "mod"
      ? `<a href="${root}moderacao.html" style="color:#f59e0b">⚙ Moderação</a>` : "";
    navEl.innerHTML = `
      ${modLink}
      <span style="color:var(--muted);font-size:0.85rem;padding:0 6px">${sessao.role === "mod" ? "🛡 " : ""}${sessao.username}</span>
      <button onclick="logout()" style="background:none;border:1px solid var(--border);color:var(--muted);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.85rem">Sair</button>`;
  }
}

initMod();
window.getSessao = getSessao;
window.logout = logout;
window.cadastrar = cadastrar;
window.login = login;
window.submeterRun = submeterRun;
window.aprovarRun = aprovarRun;
window.rejeitarRun = rejeitarRun;
window.getRunsAprovadasPorAparelho = getRunsAprovadasPorAparelho;
window.getRuns = getRuns;
window.proporRanking = proporRanking;
window.getRankingsProposto = getRankingsProposto;
window.aprovarRankingProposto = aprovarRankingProposto;
window.rejeitarRankingProposto = rejeitarRankingProposto;
window.getAparelhosExtras = getAparelhosExtras;
window.renderNav = renderNav;
window.getRootPath = getRootPath;
