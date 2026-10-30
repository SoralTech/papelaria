/* ============ CONFIGURAÇÃO (edite aqui) ============ */
const WHATSAPP = "5516999999999"; // DDI + DDD + número, só dígitos
const CATEGORIAS = ["Todos", "Festas", "Lembrancinhas", "Embalagens", "Papelaria do dia a dia"];
const PRODUTOS = [
  { id: 1, nome: "Tags personalizadas", cat: "Lembrancinhas", desc: "Para lembrancinhas, presentes e agradecimentos.", icone: "tag", cor: "#F2B6C1" },
  { id: 2, nome: "Convites", cat: "Festas", desc: "Digitais ou impressos, no tema da sua festa.", icone: "carta", cor: "#F7D9C8" },
  { id: 3, nome: "Topo de bolo", cat: "Festas", desc: "Em papel especial, com nome e idade.", icone: "bolo", cor: "#F2B6C1" },
  { id: 4, nome: "Caixas personalizadas", cat: "Embalagens", desc: "Caixas com laço e arte exclusiva.", icone: "caixa", cor: "#CBB8A7" },
  { id: 5, nome: "Adesivos e rótulos", cat: "Embalagens", desc: "Para potes, sacolas e produtos.", icone: "coracao", cor: "#F7D9C8" },
  { id: 6, nome: "Kit festa", cat: "Festas", desc: "Painel, toppers, caixinhas e muito mais.", icone: "laco", cor: "#F2B6C1" },
  { id: 7, nome: "Cadernos e planners", cat: "Papelaria do dia a dia", desc: "Capa e miolo com a sua identidade.", icone: "lapis", cor: "#CBB8A7" },
  { id: 8, nome: "Cartões de agradecimento", cat: "Papelaria do dia a dia", desc: "Para encantar clientes e convidados.", icone: "carta", cor: "#F7D9C8" }
];
/* =================================================== */

const ICONES = {
  tag: '<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.3"/>',
  carta: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  bolo: '<path d="M5 20h14M6 20v-6h12v6M4 14h16M9 10v4M15 10v4M12 4c-1 1.2 0 2 0 2s1-.8 0-2z"/>',
  caixa: '<rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 9h18V6H3zM12 6v14M12 6c-3-3-6 0-3 1h3zm0 0c3-3 6 0 3 1h-3z"/>',
  coracao: '<path d="M12 20s-8-5-8-10.500A4.500 4.500 0 0 1 12 7a4.500 4.500 0 0 1 8 2.500C20 15 12 20 12 20z"/>',
  laco: '<path d="M12 12 4 7v10zm0 0 8-5v10zM12 12v0"/><circle cx="12" cy="12" r="1.5"/><path d="m10 14-2 6M14 14l2 6"/>',
  lapis: '<path d="m4 20 1-5L16 4l4 4L9 19zM14 6l4 4"/>'
};
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const body = document.body;
let filtro = "Todos";
let carrinho = JSON.parse(sessionStorage.getItem("ap_cart") || "[]");

/* ---------- Loader (~2s) ---------- */
let loaderFeito = false;
function fecharLoader() {
  if (loaderFeito) return;
  loaderFeito = true;
  $("#loader").classList.add("done");
  body.classList.remove("is-loading");
  body.classList.add("ready");
}
const inicio = Date.now();
const aoCarregar = () => setTimeout(fecharLoader, Math.max(0, 1900 - (Date.now() - inicio)));
document.readyState === "complete" ? aoCarregar() : addEventListener("load", aoCarregar);
setTimeout(fecharLoader, 3500); // segurança: nunca prende na tela de carregamento

/* ---------- Header / menu ---------- */
const header = $("#top"), burger = $("#burger"), nav = $("#nav");
addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 30), { passive: true });
function menu(open) {
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  body.classList.toggle("lock", open);
}
burger.onclick = () => menu(!nav.classList.contains("open"));
$$("#nav a").forEach(a => a.addEventListener("click", () => menu(false)));

/* ---------- Catálogo ---------- */
function renderFiltros() {
  $("#filters").innerHTML = CATEGORIAS.map(c =>
    `<button class="chip" role="tab" aria-selected="${c === filtro}" data-c="${c}">${c}</button>`).join("");
  $$(".chip").forEach(b => b.onclick = () => { filtro = b.dataset.c; renderFiltros(); renderGrid(); });
}
function renderGrid() {
  const lista = PRODUTOS.filter(p => filtro === "Todos" || p.cat === filtro);
  $("#grid").innerHTML = lista.map(p => `
    <article class="card">
      <div class="card-art" style="background:${p.cor}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[p.icone]}</svg></div>
      <div class="card-body">
        <span class="card-cat">${p.cat}</span>
        <h3>${p.nome}</h3>
        <p>${p.desc}</p>
        <button class="add" data-id="${p.id}">Adicionar ao orçamento</button>
      </div>
    </article>`).join("");
  $$(".add").forEach(b => b.onclick = () => add(+b.dataset.id, b));
}

/* ---------- Orçamento ---------- */
function salvar() { sessionStorage.setItem("ap_cart", JSON.stringify(carrinho)); }
function add(id, btn) {
  const item = carrinho.find(i => i.id === id);
  item ? item.q++ : carrinho.push({ id, q: 1 });
  salvar(); renderCarrinho();
  const c = $("#openCart"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
  if (btn) { btn.classList.add("added"); btn.textContent = "Adicionado"; setTimeout(() => { btn.classList.remove("added"); btn.textContent = "Adicionar ao orçamento"; }, 1200); }
}
function mudar(id, d) {
  const i = carrinho.find(x => x.id === id);
  if (!i) return;
  i.q += d;
  if (i.q <= 0) carrinho = carrinho.filter(x => x.id !== id);
  salvar(); renderCarrinho();
}
function renderCarrinho() {
  const total = carrinho.reduce((s, i) => s + i.q, 0);
  $("#cartCount").textContent = total;
  $("#cartList").innerHTML = carrinho.length
    ? carrinho.map(i => {
        const p = PRODUTOS.find(x => x.id === i.id);
        return `<li class="cart-item"><strong>${p.nome}</strong><small>${p.cat}</small>
          <div class="qty"><button data-id="${i.id}" data-d="-1" aria-label="Diminuir">−</button><output>${i.q}</output><button data-id="${i.id}" data-d="1" aria-label="Aumentar">+</button></div></li>`;
      }).join("")
    : `<li class="cart-empty">Seu orçamento está vazio. Escolha peças no catálogo para começar.</li>`;
  $$(".qty button").forEach(b => b.onclick = () => mudar(+b.dataset.id, +b.dataset.d));
}
const drawer = $("#drawer"), scrim = $("#scrim");
function gaveta(open) {
  drawer.classList.toggle("open", open);
  scrim.classList.toggle("show", open);
  drawer.setAttribute("aria-hidden", !open);
  body.classList.toggle("lock", open);
}
$("#openCart").onclick = () => gaveta(true);
$("#closeCart").onclick = scrim.onclick = () => gaveta(false);
addEventListener("keydown", e => { if (e.key === "Escape") { gaveta(false); menu(false); } });

function abrirWhats(texto) {
  open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
}
$("#quoteForm").addEventListener("submit", e => {
  e.preventDefault();
  const hint = $("#hint");
  if (!carrinho.length) { hint.textContent = "Adicione ao menos uma peça do catálogo."; return; }
  const nome = $("#fName").value.trim();
  if (!nome) { hint.textContent = "Informe seu nome para continuar."; $("#fName").focus(); return; }
  hint.textContent = "";
  const data = $("#fDate").value ? $("#fDate").value.split("-").reverse().join("/") : "a combinar";
  const notas = $("#fNotes").value.trim() || "não informado";
  const itens = carrinho.map(i => `• ${i.q}x ${PRODUTOS.find(p => p.id === i.id).nome}`).join("\n");
  abrirWhats(`Olá! Meu nome é ${nome} e gostaria de um orçamento:\n\n${itens}\n\nData do evento: ${data}\nTema e detalhes: ${notas}`);
});

/* ---------- Links de WhatsApp ---------- */
$$("[data-wa]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); abrirWhats(a.dataset.wa); }));

/* ---------- Revelar títulos ---------- */
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { threshold: .25 });
$$(".reveal").forEach(el => io.observe(el));

$("#year").textContent = new Date().getFullYear();
renderFiltros(); renderGrid(); renderCarrinho();
