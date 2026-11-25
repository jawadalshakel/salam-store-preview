const STORE = "https://media.zid.store/47c689ed-24ac-4f3b-bef2-8ba4ef462435/";
const art = (file) => `https://img.zid.store/img/w=1600,q=85,f=auto/${STORE}${file}`;

const SLIDES = [art("53d88d1b-41f7-47f8-a9ca-b02ca77466ba.jpg"), art("ae029b56-4edb-4231-a104-9197fd9bddb4.png"), art("9f0bb74c-d732-4d68-872d-6febca6f30cc.png"), art("b3f2ac3c-7cda-42aa-8b1f-32500c7574c5.png")];
const CATS = [
  [art("3d62af8f-63ad-40cc-8a7b-7367e9232ee4.png"), "تجميعات الألعاب", "gamebuilds"],
  [art("6006b5eb-9289-4fab-b24c-145b124df94e.png"), "شاشات", "home"],
  [art("6ad22f8f-8c0d-48dc-8db2-bc76480a46f5.png"), "قطع بي سي", "board"],
  [art("4152e8ab-e752-4d72-ac94-056f2029303b.png"), "اكسسوارات", "https://salamstore-ksa.com/categories/1288531"],
];

const app = document.getElementById("app");
let catalog = null;
let slide = 0;

function crisp(url) {
  return String(url || "").replace("/img/w=235,", "/img/w=480,");
}

function card(item) {
  const el = document.createElement("article");
  el.className = "pcard";
  el.innerHTML = `
    <img src="${crisp(item.img)}" alt="" />
    <div class="body">
      <h3>${item.title}</h3>
      <div class="price">${item.price}</div>
      <a class="add" href="${item.href}" target="_blank" rel="noopener">أضف إلى السلة</a>
    </div>`;
  return el;
}

function row(title, list) {
  const section = document.createElement("section");
  section.className = "wrap block";
  section.innerHTML = `<div class="block-head"><h2>${title}</h2><a href="https://salamstore-ksa.com/products" target="_blank" rel="noopener">المزيد</a></div>`;
  const scroller = document.createElement("div");
  scroller.className = "row";
  list.forEach((item) => scroller.appendChild(card(item)));
  section.appendChild(scroller);
  return section;
}

function banner(src) {
  const link = document.createElement("a");
  link.className = "wrap banner";
  link.href = "https://salamstore-ksa.com/";
  link.target = "_blank";
  link.rel = "noopener";
  link.innerHTML = `<img src="${src}" alt="" />`;
  return link;
}

function showFilter(key, label) {
  const list = catalog[key] || [];
  app.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "wrap";
  wrap.innerHTML = `<div class="block-head" style="margin-top:1.2rem"><h2>${label}</h2></div>`;
  const grid = document.createElement("div");
  grid.className = "results";
  if (!list.length) grid.innerHTML = `<p class="empty">لا توجد منتجات ظاهرة في هذا التصنيف حالياً.</p>`;
  else list.forEach((item) => grid.appendChild(card(item)));
  wrap.appendChild(grid);
  app.appendChild(wrap);
}

function home() {
  app.innerHTML = "";
  const sliderWrap = document.createElement("div");
  sliderWrap.className = "wrap";
  const frame = document.createElement("div");
  frame.className = "slider";
  const img = document.createElement("img");
  const dots = document.createElement("div");
  dots.className = "dots";
  const paint = () => {
    img.src = SLIDES[slide];
    dots.innerHTML = SLIDES.map((_, i) => `<button type="button" class="${i === slide ? "on" : ""}" data-dot="${i}"></button>`).join("");
  };
  paint();
  const prev = document.createElement("button");
  prev.className = "prev";
  prev.type = "button";
  prev.textContent = "‹";
  const next = document.createElement("button");
  next.className = "next";
  next.type = "button";
  next.textContent = "›";
  prev.onclick = () => { slide = (slide + SLIDES.length - 1) % SLIDES.length; paint(); };
  next.onclick = () => { slide = (slide + 1) % SLIDES.length; paint(); };
  dots.onclick = (event) => {
    const dot = event.target.closest("[data-dot]");
    if (!dot) return;
    slide = Number(dot.dataset.dot);
    paint();
  };
  frame.append(img, prev, next);
  sliderWrap.append(frame, dots);

  const trust = document.createElement("div");
  trust.className = "wrap trust";
  trust.innerHTML = "<strong>شحن سريع داخل السعودية</strong><strong>ضمان رسمي</strong><strong>منتجات أصلية 100%</strong><strong>دعم فني متخصص</strong>";

  const catTitle = document.createElement("h2");
  catTitle.className = "wrap section-title";
  catTitle.textContent = "ابرز التصنيفات";
  const cats = document.createElement("div");
  cats.className = "wrap cats";
  CATS.forEach(([src, label, target]) => {
    const a = document.createElement("a");
    a.href = "#";
    a.innerHTML = `<img src="${src}" alt="${label}" />`;
    a.addEventListener("click", (event) => {
      event.preventDefault();
      if (String(target).startsWith("http")) window.open(target, "_blank", "noopener");
      else showFilter(target, label);
    });
    cats.appendChild(a);
  });

  const items = (key) => catalog[key] || [];
  app.append(
    sliderWrap,
    trust,
    catTitle,
    cats,
    row("شاشات", items("home").slice(2, 12)),
    banner(art("ae029b56-4edb-4231-a104-9197fd9bddb4.png")),
    row("تجميعات الألعاب", items("gamebuilds")),
    banner(art("b3f2ac3c-7cda-42aa-8b1f-32500c7574c5.png")),
    row("طاولات وكراسي", items("home").filter((item) => /طاولة|كرسي/.test(item.title))),
    row("المعالجات", items("cpu")),
    row("اللوحة الأم", items("board").slice(0, 10)),
    banner(art("53d88d1b-41f7-47f8-a9ca-b02ca77466ba.jpg")),
    row("الصناديق", items("case").slice(0, 10)),
  );
}

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const q = document.getElementById("search-input").value.trim().toLowerCase();
  if (!q || !catalog) return home();
  const pool = Object.values(catalog).flat().filter((item) => item.title.toLowerCase().includes(q));
  app.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "wrap";
  wrap.innerHTML = `<div class="block-head" style="margin-top:1.2rem"><h2>نتائج البحث</h2></div>`;
  const grid = document.createElement("div");
  grid.className = "results";
  if (!pool.length) grid.innerHTML = `<p class="empty">لا توجد نتائج.</p>`;
  else pool.forEach((item) => grid.appendChild(card(item)));
  wrap.appendChild(grid);
  app.appendChild(wrap);
});

document.querySelectorAll(".menu a[data-key]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const names = { gamebuilds: "تجميعات الألعاب", home: "شاشات", board: "قطع بي سي" };
    showFilter(link.dataset.key, names[link.dataset.key]);
  });
});

fetch("../zid/catalog.json")
  .then((res) => res.json())
  .then((data) => {
    catalog = data;
    home();
  });
