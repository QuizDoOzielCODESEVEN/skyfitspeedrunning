// Hash simples (djb2) — sem servidor, sem crypto pesado
function hashSenha(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++)
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  return (hash >>> 0).toString(16);
}

// Seed da conta moderador — gerada uma vez e persistida
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

function getUsers() {
  return JSON.parse(localStorage.getItem("sfsr_users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("sfsr_users", JSON.stringify(users));
}

function getSessao() {
  return JSON.parse(localStorage.getItem("sfsr_sessao") || "null");
}

function setSessao(user) {
  localStorage.setItem("sfsr_sessao", JSON.stringify({
    id: user.id, username: user.username, role: user.role
  }));
}

function logout() {
  localStorage.removeItem("sfsr_sessao");
  window.location.href = getRootPath() + "index.html";
}

function getRootPath() {
  // Detecta se está dentro de /aparelhos/
  return location.pathname.includes("/aparelhos/") ? "../" : "";
}

function cadastrar(username, senha) {
  if (username.length < 3) return { ok: false, msg: "Nome de usuário muito curto (mín. 3 caracteres)." };
  if (senha.length < 6) return { ok: false, msg: "Senha muito curta (mín. 6 caracteres)." };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { ok: false, msg: "Nome de usuário só pode ter letras, números e _." };

  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
    return { ok: false, msg: "Nome de usuário já está em uso." };

  const user = {
    id: "u_" + Date.now(),
    username,
    senha: hashSenha(senha),
    role: "runner",
    criadoEm: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  setSessao(user);
  return { ok: true };
}

function login(username, senha) {
  const users = getUsers();
  const user = users.find(u =>
    u.username.toLowerCase() === username.toLowerCase() &&
    u.senha === hashSenha(senha)
  );
  if (!user) return { ok: false, msg: "Usuário ou senha incorretos." };
  setSessao(user);
  return { ok: true, role: user.role };
}

// ── RUNS ──────────────────────────────────────────────────────────────────────
function getRuns() {
  return JSON.parse(localStorage.getItem("sfsr_runs") || "[]");
}

function saveRuns(runs) {
  localStorage.setItem("sfsr_runs", JSON.stringify(runs));
}

function submeterRun(aparelhoId, categoria, tempo, prova) {
  const sessao = getSessao();
  if (!sessao) return { ok: false, msg: "Você precisa estar logado." };
  const run = {
    id: "r_" + Date.now(),
    aparelhoId, categoria, tempo, prova,
    runner: sessao.username,
    runnerId: sessao.id,
    status: "pendente",
    criadoEm: new Date().toISOString()
  };
  const runs = getRuns();
  runs.push(run);
  saveRuns(runs);
  return { ok: true };
}

function aprovarRun(runId) {
  const runs = getRuns();
  const run = runs.find(r => r.id === runId);
  if (!run) return;
  run.status = "aprovada";
  saveRuns(runs);
}

function rejeitarRun(runId) {
  const runs = getRuns();
  const idx = runs.findIndex(r => r.id === runId);
  if (idx === -1) return;
  runs.splice(idx, 1);
  saveRuns(runs);
}

function getRunsAprovadasPorAparelho(aparelhoId) {
  return getRuns()
    .filter(r => r.aparelhoId === aparelhoId && r.status === "aprovada")
    .sort((a, b) => a.tempo.localeCompare(b.tempo, undefined, { numeric: true }))
    .map((r, i) => ({ ...r, pos: i + 1 }));
}

// ── FÓRUM ─────────────────────────────────────────────────────────────────────
function getPosts() {
  return JSON.parse(localStorage.getItem("sfsr_posts") || "[]");
}

function savePosts(posts) {
  localStorage.setItem("sfsr_posts", JSON.stringify(posts));
}

function criarPost(titulo, conteudo) {
  const sessao = getSessao();
  if (!sessao) return { ok: false, msg: "Você precisa estar logado." };
  if (!titulo.trim() || !conteudo.trim()) return { ok: false, msg: "Preencha todos os campos." };
  if (titulo.length > 100) return { ok: false, msg: "Título muito longo (máx. 100 caracteres)." };

  const post = {
    id: "p_" + Date.now(),
    titulo: titulo.trim(),
    conteudo: conteudo.trim(),
    autor: sessao.username,
    autorId: sessao.id,
    criadoEm: new Date().toISOString()
  };
  const posts = getPosts();
  posts.unshift(post);
  savePosts(posts);
  return { ok: true };
}

function deletarPost(postId) {
  const posts = getPosts();
  savePosts(posts.filter(p => p.id !== postId));
}

// ── NAV DINÂMICA ──────────────────────────────────────────────────────────────
function renderNav() {
  const sessao = getSessao();
  const root = getRootPath();
  const navEl = document.getElementById("nav-auth");
  if (!navEl) return;

  if (!sessao) {
    navEl.innerHTML = `<a href="${root}login.html">Entrar</a><a href="${root}cadastro.html" style="background:var(--accent);color:#fff;border-radius:6px;padding:6px 14px">Cadastrar</a>`;
  } else {
    const modLink = sessao.role === "mod"
      ? `<a href="${root}moderacao.html" style="color:#f59e0b">⚙ Moderação</a>` : "";
    navEl.innerHTML = `
      ${modLink}
      <a href="${root}forum.html">Fórum</a>
      <span style="color:var(--muted);font-size:0.85rem;padding:0 6px">
        ${sessao.role === "mod" ? "🛡 " : ""}${sessao.username}
      </span>
      <button onclick="logout()" style="background:none;border:1px solid var(--border);color:var(--muted);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.85rem">Sair</button>
    `;
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
window.getPosts = getPosts;
window.criarPost = criarPost;
window.deletarPost = deletarPost;
window.renderNav = renderNav;
window.getRootPath = getRootPath;
