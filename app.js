/* =========================================================
   regioni-tracker — motore condiviso (app.js)
   Legge ?r= dall'URL, costruisce nav, header, statistiche,
   filtri e griglia di schede. Generico: tutti i contenuti
   arrivano da window.DASH[<r>] (file in data/).
   ========================================================= */

/* Lista condivisa con index.html (hub). Aggiungere qui le nuove Regioni. */
const REGIONI = [
  { r: "piemonte",           nome: "Piemonte",              area: "Nord" },
  { r: "valledaosta",        nome: "Valle d'Aosta",         area: "Nord" },
  { r: "lombardia",          nome: "Lombardia",             area: "Nord" },
  { r: "trentinoaltoadige",  nome: "Trentino-Alto Adige",   area: "Nord" },
  { r: "veneto",             nome: "Veneto",                area: "Nord" },
  { r: "friuliveneziagiulia",nome: "Friuli-Venezia Giulia", area: "Nord" },
  { r: "liguria",            nome: "Liguria",               area: "Nord" },
  { r: "emiliaromagna",      nome: "Emilia-Romagna",        area: "Nord" },
  { r: "toscana",            nome: "Toscana",               area: "Centro" },
  { r: "umbria",             nome: "Umbria",                area: "Centro" },
  { r: "marche",             nome: "Marche",                area: "Centro" },
  { r: "lazio",              nome: "Lazio",                 area: "Centro" },
  { r: "abruzzo",            nome: "Abruzzo",               area: "Sud e Isole" },
  { r: "molise",             nome: "Molise",                area: "Sud e Isole" },
  { r: "campania",           nome: "Campania",              area: "Sud e Isole" },
  { r: "puglia",             nome: "Puglia",                area: "Sud e Isole" },
  { r: "basilicata",         nome: "Basilicata",            area: "Sud e Isole" },
  { r: "calabria",           nome: "Calabria",              area: "Sud e Isole" },
  { r: "sicilia",            nome: "Sicilia",               area: "Sud e Isole" },
  { r: "sardegna",           nome: "Sardegna",              area: "Sud e Isole" }
];

const MACRO_AREE = ["Nord", "Centro", "Sud e Isole"];

/* ---------- utilità ---------- */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function getRegioneKey() {
  const p = new URLSearchParams(location.search).get("r");
  if (p && window.DASH && window.DASH[p]) return p;
  return REGIONI[0].r;
}

/* ---------- scheda KPI condivisa ---------- */
function kpiCardHtml(it, i, D) {
  const badge = "<span class='badge " + esc(it.bCls) + "'>" + esc(it.badge) + "</span>";
  const bar = "<div class='bar'><div class='bar-in' style='width:" +
    Math.max(0, Math.min(100, it.barPct || 0)) + "%;background:" + esc(it.barCol || "var(--blue)") + "'></div></div>";
  const delta = it.delta
    ? "<div class='kpi-delta " + esc(it.deltaCls || "") + "'><span>" + esc(it.delta) + "</span><small>" + esc(it.deltaSub || "") + "</small></div>"
    : "";
  return "<article class='card' data-i='" + i + "'>" +
    "<div class='card-top'><span class='card-area'>" + esc(it.area) + "</span>" + badge + "</div>" +
    "<h3>" + esc(it.title) + "</h3>" +
    "<p class='promise'>" + esc(it.promise) + "</p>" +
    "<div class='kpi'><div class='kpi-main'><span class='kpi-cur'>" + esc(it.cur) + "</span>" +
    "<span class='kpi-lbl'>" + esc(it.curLbl) + "</span></div>" + delta + "</div>" +
    bar +
    "<div class='card-detail'>" +
    "<p><b>" + esc(D.ui.startLabel || "Punto di partenza") + ":</b> " + esc(it.base) + "</p>" +
    "<p><b>" + esc(D.ui.noteLabel || "Nota") + ":</b> " + esc(it.note) + "</p>" +
    "<p class='src'><b>" + esc(D.ui.sourceLabel || "Fonte") + ":</b> " +
    "<a href='" + esc(it.url) + "' target='_blank' rel='noopener'>" + esc(it.src) + "</a> · " + esc(it.asof) + "</p>" +
    "</div></article>";
}

/* ---------- dashboard nazionale in cima alla home (index.html) ---------- */
function renderGovHome() {
  const el = document.getElementById("gov");
  if (!el || !window.DASH || !window.DASH.governo) return;
  const D = window.DASH.governo;

  let html = "<div class='gov-head'>" +
    "<span class='gov-emoji'>" + esc(D.meta.stemma || "🇮🇹") + "</span>" +
    "<div class='gov-head-txt'>" +
    "<h2>" + esc(D.meta.nome) + "</h2>" +
    "<p class='gov-sub'>" + esc(D.ui.sub) + "</p>" +
    "<p class='gov-pres'>Presidente del Consiglio: <b>" + esc(D.meta.presidente) + "</b> · " + esc(D.meta.maggioranza) + "</p>" +
    "</div></div>";

  html += "<div class='grid gov-grid'>";
  D.items.forEach((it, i) => { html += kpiCardHtml(it, i, D); });
  html += "</div>";

  el.innerHTML = html;
  el.querySelectorAll(".card").forEach(c => {
    c.addEventListener("click", e => {
      if (e.target.closest("a")) return;
      c.classList.toggle("open");
    });
  });
}

/* ---------- HUB (index.html) ---------- */
function renderHub() {
  const hub = document.getElementById("hub");
  if (!hub) return;
  let html = "";
  MACRO_AREE.forEach(area => {
    const list = REGIONI.filter(x => x.area === area);
    html += "<section class='hub-group'><h2>" + esc(area) + "</h2><div class='hub-grid'>";
    list.forEach(x => {
      const d = window.DASH && window.DASH[x.r];
      const pres = d && d.meta ? d.meta.presidente : "";
      const magg = d && d.meta ? d.meta.maggioranza : "";
      const stemma = d && d.meta && d.meta.stemma ? d.meta.stemma : "🏛️";
      html += "<a class='hub-card' href='regione.html?r=" + encodeURIComponent(x.r) + "'>" +
        "<span class='hub-emoji'>" + stemma + "</span>" +
        "<span class='hub-name'>" + esc(x.nome) + "</span>" +
        (pres ? "<span class='hub-pres'>" + esc(pres) + " · " + esc(magg) + "</span>" : "") +
        "</a>";
    });
    html += "</div></section>";
  });
  hub.innerHTML = html;
}

/* ---------- barra di navigazione (comune) ---------- */
function renderNav(currentKey) {
  const nav = document.getElementById("regnav");
  if (!nav) return;
  let html = "<a class='nav-home' href='index.html'>🏛️ Tutte le Regioni</a><div class='nav-groups'>";
  MACRO_AREE.forEach(area => {
    html += "<div class='nav-group'><span class='nav-area'>" + esc(area) + "</span>";
    REGIONI.filter(x => x.area === area).forEach(x => {
      const cls = x.r === currentKey ? "nav-link active" : "nav-link";
      html += "<a class='" + cls + "' href='regione.html?r=" + encodeURIComponent(x.r) + "'>" + esc(x.nome) + "</a>";
    });
    html += "</div>";
  });
  html += "</div>";
  nav.innerHTML = html;
}

/* ---------- DASHBOARD (regione.html) ---------- */
function renderDash() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const key = getRegioneKey();
  const D = window.DASH[key];
  if (!D) { grid.innerHTML = "<p>Dati non trovati per «" + esc(key) + "».</p>"; return; }

  renderNav(key);
  document.title = D.meta.nome + " — Programma vs Realtà";

  /* header */
  document.getElementById("stemma").textContent = D.meta.stemma || "🏛️";
  document.getElementById("h1").textContent = D.ui.h1;
  document.getElementById("sub").textContent = D.ui.sub;
  document.getElementById("meta").innerHTML = D.ui.metaHtml;
  document.getElementById("pres").textContent =
    "Presidente: " + D.meta.presidente + " · Maggioranza: " + D.meta.maggioranza;
  document.getElementById("search").placeholder = D.ui.searchPlaceholder || "Cerca…";
  document.getElementById("hint").textContent = D.ui.hint || "";
  document.getElementById("footer").innerHTML = D.ui.footerHtml || "";

  /* stato dei filtri */
  let fArea = null;    // area selezionata (null = tutte)
  let fStatus = null;  // stato selezionato (null = tutti)
  let fText = "";      // ricerca testuale

  /* statistiche per stato (cliccabili) */
  const statsEl = document.getElementById("stats");
  function renderStats() {
    const counts = {};
    D.items.forEach(it => { counts[it.status] = (counts[it.status] || 0) + 1; });
    let html = "";
    Object.keys(D.status).forEach(k => {
      const s = D.status[k];
      const on = fStatus === k ? " on" : "";
      html += "<button class='stat " + esc(s.cls) + on + "' data-k='" + esc(k) + "'>" +
        "<span class='stat-n'>" + (counts[k] || 0) + "</span>" +
        "<span class='stat-l'>" + esc(s.label) + "</span></button>";
    });
    statsEl.innerHTML = html;
    statsEl.querySelectorAll(".stat").forEach(b => {
      b.addEventListener("click", () => {
        fStatus = (fStatus === b.dataset.k) ? null : b.dataset.k;
        renderStats(); renderChips(); renderGrid();
      });
    });
  }

  /* chip per area */
  const chipsEl = document.getElementById("chips");
  function renderChips() {
    const aree = [];
    D.items.forEach(it => { if (aree.indexOf(it.area) < 0) aree.push(it.area); });
    let html = "<button class='chip" + (fArea === null ? " on" : "") + "' data-a=''>" +
      esc(D.ui.chipsAll || "Tutte le aree") + "</button>";
    aree.forEach(a => {
      html += "<button class='chip" + (fArea === a ? " on" : "") + "' data-a='" + esc(a) + "'>" + esc(a) + "</button>";
    });
    chipsEl.innerHTML = html;
    chipsEl.querySelectorAll(".chip").forEach(c => {
      c.addEventListener("click", () => {
        fArea = c.dataset.a === "" ? null : c.dataset.a;
        renderChips(); renderGrid();
      });
    });
  }

  /* griglia di schede */
  function cardHtml(it, i) {
    const badge = "<span class='badge " + esc(it.bCls) + "'>" + esc(it.badge) + "</span>";
    const bar = "<div class='bar'><div class='bar-in' style='width:" +
      Math.max(0, Math.min(100, it.barPct || 0)) + "%;background:" + esc(it.barCol || "var(--blue)") + "'></div></div>";
    const delta = it.delta
      ? "<div class='kpi-delta " + esc(it.deltaCls || "") + "'><span>" + esc(it.delta) + "</span><small>" + esc(it.deltaSub || "") + "</small></div>"
      : "";
    return "<article class='card' data-i='" + i + "'>" +
      "<div class='card-top'><span class='card-area'>" + esc(it.area) + "</span>" + badge + "</div>" +
      "<h3>" + esc(it.title) + "</h3>" +
      "<p class='promise'>" + esc(it.promise) + "</p>" +
      "<div class='kpi'><div class='kpi-main'><span class='kpi-cur'>" + esc(it.cur) + "</span>" +
      "<span class='kpi-lbl'>" + esc(it.curLbl) + "</span></div>" + delta + "</div>" +
      bar +
      "<div class='card-detail'>" +
      "<p><b>" + esc(D.ui.startLabel || "Punto di partenza") + ":</b> " + esc(it.base) + "</p>" +
      "<p><b>" + esc(D.ui.noteLabel || "Nota") + ":</b> " + esc(it.note) + "</p>" +
      "<p class='src'><b>" + esc(D.ui.sourceLabel || "Fonte") + ":</b> " +
      "<a href='" + esc(it.url) + "' target='_blank' rel='noopener'>" + esc(it.src) + "</a> · " + esc(it.asof) + "</p>" +
      "</div></article>";
  }

  function renderGrid() {
    const q = fText.trim().toLowerCase();
    let html = "";
    let n = 0;
    D.items.forEach((it, i) => {
      if (fArea && it.area !== fArea) return;
      if (fStatus && it.status !== fStatus) return;
      if (q) {
        const blob = (it.area + " " + it.title + " " + it.promise + " " + it.note + " " + it.curLbl).toLowerCase();
        if (blob.indexOf(q) < 0) return;
      }
      html += cardHtml(it, i);
      n++;
    });
    grid.innerHTML = n ? html : "<p class='empty'>" + esc(D.ui.emptyMsg || "Nessun risultato.") + "</p>";
    grid.querySelectorAll(".card").forEach(c => {
      c.addEventListener("click", e => {
        if (e.target.closest("a")) return; // non chiudere cliccando il link fonte
        c.classList.toggle("open");
      });
    });
  }

  document.getElementById("search").addEventListener("input", e => {
    fText = e.target.value; renderGrid();
  });

  renderStats(); renderChips(); renderGrid();
}

/* ---------- avvio ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderGovHome(); // attivo solo se esiste #gov (index.html)
  renderHub();     // attivo solo se esiste #hub (index.html)
  renderDash();    // attivo solo se esiste #grid (regione.html)
});
