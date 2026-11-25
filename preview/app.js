const CATS = [
  ["cpu", "المعالج"],
  ["board", "اللوحة الأم"],
  ["gpu", "كرت الشاشة"],
  ["ram", "الرام"],
  ["storage", "التخزين"],
  ["cooler", "التبريد"],
  ["psu", "مزود الطاقة"],
  ["case", "الصندوق"],
  ["home", "شاشات"],
  ["gamebuilds", "تجميعات"],
];

const state = { catalog: null, page: "home", filter: null, query: "", picks: {}, slide: 0 };
const app = document.getElementById("app");

function money(text) {
  const n = Number(String(text || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function formatSar(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ر.س";
}
function items(key) {
  return state.catalog[key] || [];
}

function productCard(item) {
  const el = document.createElement("article");
  el.className = "pcard";
  el.innerHTML = `
    <div class="media">
      <img src="${item.img}" alt="" />
    </div>
    <div class="body">
      <h3>${item.title}</h3>
      <div class="price">${item.price}</div>
      <a class="add" href="${item.href}" target="_blank" rel="noopener">إضافة للسلة</a>
    </div>`;
  return el;
}

function row(list, id) {
  const wrap = document.createElement("div");
  wrap.className = "scroller";
  const scroller = document.createElement("div");
  scroller.className = "row";
  scroller.id = id;
  list.forEach((item) => scroller.appendChild(productCard(item)));
  const prev = document.createElement("button");
  prev.className = "arrow prev";
  prev.type = "button";
  prev.textContent = "‹";
  const next = document.createElement("button");
  next.className = "arrow next";
  next.type = "button";
  next.textContent = "›";
  const shift = (dir) => scroller.scrollBy({ left: dir * 230, behavior: "smooth" });
  prev.addEventListener("click", () => shift(1));
  next.addEventListener("click", () => shift(-1));
  wrap.append(prev, scroller, next);
  return wrap;
}

function openFilter(key, label) {
  state.filter = key;
  state.filterLabel = label || "";
  state.query = "";
  go("home");
}

const STORE = "https://media.zid.store/47c689ed-24ac-4f3b-bef2-8ba4ef462435/";
function storeArt(file) {
  return `https://img.zid.store/img/w=1600,q=85,f=auto/${STORE}${file}`;
}
const ART = {
  rog: storeArt("53d88d1b-41f7-47f8-a9ca-b02ca77466ba.jpg"),
  agent: storeArt("9f0bb74c-d732-4d68-872d-6febca6f30cc.png"),
  screens: storeArt("ae029b56-4edb-4231-a104-9197fd9bddb4.png"),
  desk: storeArt("b3f2ac3c-7cda-42aa-8b1f-32500c7574c5.png"),
  builds: storeArt("3d62af8f-63ad-40cc-8a7b-7367e9232ee4.png"),
  monitors: storeArt("6006b5eb-9289-4fab-b24c-145b124df94e.png"),
  parts: storeArt("6ad22f8f-8c0d-48dc-8db2-bc76480a46f5.png"),
  gear: storeArt("4152e8ab-e752-4d72-ac94-056f2029303b.png"),
};

function shot(entry) {
  const link = document.createElement("a");
  link.className = entry.clean ? "shot art" : "shot";
  link.href = entry.href || "#home";
  if (entry.href) {
    link.target = "_blank";
    link.rel = "noopener";
  }
  const pos = entry.pos ? ` style="object-position:${entry.pos}"` : "";
  link.innerHTML = `<img src="${entry.img}" alt=""${pos} /><span>${entry.title || ""}</span>`;
  if (!entry.href) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (entry.page) go(entry.page);
      else openFilter(entry.key, entry.title);
    });
  }
  return link;
}

function bannerGroup(count, entries) {
  const row = document.createElement("div");
  row.className = `banner-row cols-${count}`;
  if (count === 3) {
    const stack = document.createElement("div");
    stack.className = "banner-stack";
    stack.append(shot(entries[1]), shot(entries[2]));
    row.append(stack, shot(entries[0]));
    return row;
  }
  entries.slice(0, count).forEach((entry) => row.appendChild(shot(entry)));
  return row;
}

function section(title, list, more) {
  const frag = document.createDocumentFragment();
  const head = document.createElement("div");
  head.className = "section-head";
  head.innerHTML = `<h2>${title}</h2>`;
  const a = document.createElement("a");
  a.href = "#home";
  a.textContent = "عرض الكل";
  a.addEventListener("click", (event) => {
    event.preventDefault();
    openFilter(more, title);
  });
  head.appendChild(a);
  frag.append(head, row(list, "row-" + title));
  return frag;
}

function renderHome() {
  const frag = document.createElement("div");
  const slides = [
    { img: ART.rog, page: "bundles" },
    { img: ART.screens, filter: "home", label: "شاشات" },
    { img: ART.agent, href: "https://www.asus.com/microsite/agent-computer/" },
    { img: ART.desk, filter: "home", label: "طاولات وكراسي" },
  ];
  const hero = document.createElement("section");
  hero.className = "hero";
  const slide = document.createElement("div");
  slide.className = "slide art";
  const paint = () => {
    const current = slides[state.slide % slides.length];
    slide.style.backgroundImage = `url('${current.img}')`;
    slide.innerHTML = `<div class="dots">${slides.map((_, i) => `<button type="button" class="${i === state.slide ? "on" : ""}" data-dot="${i}"></button>`).join("")}</div>`;
    slide.onclick = (event) => {
      const dot = event.target.closest("[data-dot]");
      if (dot) {
        state.slide = Number(dot.dataset.dot);
        paint();
        return;
      }
      if (current.href) window.open(current.href, "_blank", "noopener");
      else if (current.page) go(current.page);
      else openFilter(current.filter, current.label);
    };
  };
  paint();
  hero.append(slide);
  frag.appendChild(hero);

  const title = document.createElement("h2");
  title.className = "block-title";
  title.id = "cats";
  title.textContent = "التصنيفات";
  frag.appendChild(title);
  const cats = document.createElement("div");
  cats.className = "row";
  CATS.forEach(([key, label]) => {
    const sample = items(key)[0];
    const btn = document.createElement("button");
    btn.className = "cat";
    btn.type = "button";
    btn.innerHTML = sample
      ? `<img src="${sample.img}" alt="" /><span>${label}</span>`
      : `<span>${label}</span>`;
    btn.addEventListener("click", () => {
      state.filter = key;
      state.query = "";
      go("home");
    });
    cats.appendChild(btn);
  });
  frag.appendChild(cats);

  if (state.query || state.filter) {
    const pool = state.query
      ? Object.values(state.catalog).flat().filter((item) => item.title.toLowerCase().includes(state.query.toLowerCase()))
      : items(state.filter);
    const head = document.createElement("div");
    head.className = "section-head";
    const label = state.query ? "نتائج البحث" : (state.filterLabel || CATS.find((c) => c[0] === state.filter)?.[1] || "المنتجات");
    head.innerHTML = `<h2>${label}</h2>`;
    frag.appendChild(head);
    const grid = document.createElement("div");
    grid.className = "grid";
    if (!pool.length) {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">لا توجد منتجات ظاهرة في هذا التصنيف على المتجر حالياً.</div>`;
    } else pool.forEach((item) => grid.appendChild(productCard(item)));
    frag.appendChild(grid);
    return frag;
  }

  frag.appendChild(bannerGroup(1, [
    { title: "شاشات", key: "home", img: ART.screens, clean: true },
  ]));
  frag.appendChild(section("وصل حديثاً", items("home").slice(0, 10), "home"));
  frag.appendChild(section("تجميعات الألعاب", items("gamebuilds"), "gamebuilds"));
  frag.appendChild(bannerGroup(2, [
    { title: "تجميعات", page: "bundles", img: ART.rog, clean: true },
    { title: "طاولات وكراسي", key: "home", img: ART.desk, clean: true },
  ]));
  frag.appendChild(section("المعالجات", items("cpu"), "cpu"));
  frag.appendChild(section("اللوحة الأم", items("board"), "board"));
  frag.appendChild(bannerGroup(3, [
    { title: "تجميعات الألعاب", page: "bundles", img: ART.builds, pos: "70% 46%", clean: true },
    { title: "قطع الكمبيوتر", key: "board", img: ART.parts, pos: "78% 42%", clean: true },
    { title: "اكسسوارات", href: "https://salamstore-ksa.com/categories/1288531/%D8%A7%D9%83%D8%B3%D8%B3%D9%88%D8%A7%D8%B1%D8%A7%D8%AA", img: ART.gear, pos: "72% 55%", clean: true },
  ]));
  frag.appendChild(section("الرام", items("ram"), "ram"));
  frag.appendChild(section("التخزين", items("storage"), "storage"));
  frag.appendChild(section("التبريد", items("cooler").slice(0, 10), "cooler"));
  frag.appendChild(bannerGroup(1, [
    { title: "Agent Computer", href: "https://www.asus.com/microsite/agent-computer/", img: ART.agent, clean: true },
  ]));
  frag.appendChild(section("مزودات الطاقة", items("psu").slice(0, 10), "psu"));
  frag.appendChild(section("الصناديق", items("case").slice(0, 10), "case"));

  const trust = document.createElement("section");
  trust.className = "trust";
  trust.innerHTML = `
    <div><strong>منتجات المتجر</strong><span>البطاقات من كتالوج احساس السلام كما هو منشور.</span></div>
    <div><strong>جدة، الشرفية</strong><span>2748-2730 خالد بن ثابت، جدة 23216</span></div>
    <div><strong>الطلب من زد</strong><span>إضافة للسلة تفتح المنتج في المتجر المباشر.</span></div>`;
  frag.appendChild(trust);
  return frag;
}

function platform(title) {
  const t = title.toUpperCase();
  if (/\bAMD\b|RYZEN|B840|B650|X670|A620/.test(t)) return "amd";
  if (/INTEL|CORE I|ULTRA|B760|Z790|H610|B660/.test(t)) return "intel";
  return "";
}
function memory(title) {
  if (/DDR5/i.test(title)) return "ddr5";
  if (/DDR4/i.test(title)) return "ddr4";
  return "";
}

function renderBuild() {
  const frag = document.createElement("div");
  const wrap = document.createElement("div");
  wrap.className = "slots";
  const form = document.createElement("div");
  form.className = "panel";
  form.innerHTML = `<div class="section-head"><h2>بناء الكمبيوتر</h2></div>`;
  const slots = CATS.filter(([key]) => !["home", "gamebuilds"].includes(key));
  slots.forEach(([id, label]) => {
    const list = items(id);
    const rowEl = document.createElement("div");
    rowEl.className = "slot";
    const options = [`<option value="">${list.length ? "اختر" : "لا توجد منتجات في التصنيف"}</option>`]
      .concat(list.map((item, i) => `<option value="${i}">${item.title} — ${item.price}</option>`))
      .join("");
    rowEl.innerHTML = `<label>${label}</label><select ${list.length ? "" : "disabled"}>${options}</select>`;
    const select = rowEl.querySelector("select");
    if (state.picks[id] != null) select.value = String(state.picks[id]);
    select.addEventListener("change", () => {
      state.picks[id] = select.value === "" ? null : Number(select.value);
      render();
    });
    form.appendChild(rowEl);
  });

  const picked = slots.map(([id]) => {
    const index = state.picks[id];
    return index == null ? null : { id, item: items(id)[index] };
  }).filter(Boolean);
  const total = picked.reduce((sum, rowEl) => sum + money(rowEl.item.price), 0);
  const cpu = picked.find((rowEl) => rowEl.id === "cpu");
  const board = picked.find((rowEl) => rowEl.id === "board");
  const ram = picked.find((rowEl) => rowEl.id === "ram");
  const warnings = [];
  if (cpu && board && platform(cpu.item.title) && platform(board.item.title) && platform(cpu.item.title) !== platform(board.item.title)) {
    warnings.push("المعالج واللوحة لا يبدوان من نفس المنصة حسب اسم المنتج.");
  }
  if (board && ram && memory(board.item.title) && memory(ram.item.title) && memory(board.item.title) !== memory(ram.item.title)) {
    warnings.push("الرام واللوحة لا يبدوان من نفس جيل الذاكرة حسب الاسم.");
  }
  if (!items("gpu").length) warnings.push("تصنيف كرت الشاشة لا يعرض منتجات على المتجر حالياً.");

  const summary = document.createElement("aside");
  summary.className = "panel summary";
  summary.innerHTML = `<h2>المجموع</h2><div class="total">${formatSar(total)}</div><p class="note">مجموع أسعار القطع. الشحن يُحسب في زد.</p><div class="links"></div>`;
  const links = summary.querySelector(".links");
  picked.forEach((rowEl) => {
    const a = document.createElement("a");
    a.href = rowEl.item.href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = rowEl.item.title;
    links.appendChild(a);
  });
  warnings.forEach((text) => {
    const p = document.createElement("p");
    p.className = "warn";
    p.textContent = text;
    summary.appendChild(p);
  });
  wrap.append(form, summary);
  frag.appendChild(wrap);
  return frag;
}

function renderBundles() {
  const frag = document.createElement("div");
  const head = document.createElement("div");
  head.className = "section-head";
  head.innerHTML = `<h2>التجميعات</h2><p class="note">كل تجميعة منتج واحد في المتجر</p>`;
  const grid = document.createElement("div");
  grid.className = "grid";
  items("gamebuilds").forEach((item) => grid.appendChild(productCard(item)));
  frag.append(head, grid);
  return frag;
}

function renderPerformance() {
  const frag = document.createElement("div");
  const panel = document.createElement("div");
  panel.className = "panel";
  const builds = items("gamebuilds");
  panel.innerHTML = `
    <div class="section-head"><h2>أداء تجميعتك</h2></div>
    <select id="perf-build">${builds.map((item, i) => `<option value="${i}">${item.title}</option>`).join("")}</select>
    <div id="perf-body"></div>`;
  frag.appendChild(panel);
  const body = panel.querySelector("#perf-body");
  const draw = () => {
    const item = builds[Number(panel.querySelector("#perf-build").value)];
    body.innerHTML = "";
    if (!item) return;
    const grid = document.createElement("div");
    grid.className = "grid";
    grid.style.marginTop = "1rem";
    grid.appendChild(productCard(item));
    body.appendChild(grid);
    ["Fortnite", "Valorant", "Call of Duty", "Cyberpunk 2077", "EA FC"].forEach((name) => {
      const line = document.createElement("div");
      line.className = "slot";
      line.innerHTML = `<label>${name}</label><div class="note">لا يوجد رقم إطارات في بيانات المتجر</div>`;
      body.appendChild(line);
    });
  };
  panel.querySelector("#perf-build").addEventListener("change", draw);
  draw();
  return frag;
}

function render() {
  const pages = { home: renderHome, build: renderBuild, bundles: renderBundles, performance: renderPerformance };
  app.replaceChildren((pages[state.page] || renderHome)());
  document.querySelectorAll(".subnav [data-nav], .dock [data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === state.page && !link.dataset.filter && !link.dataset.jump);
  });
}

function go(page) {
  state.page = page;
  if (location.hash !== "#" + page) history.replaceState(null, "", "#" + page);
  render();
  window.scrollTo(0, 0);
}

document.body.addEventListener("click", (event) => {
  const link = event.target.closest("[data-nav]");
  if (!link || link.target === "_blank") return;
  event.preventDefault();
  if (link.dataset.filter) {
    state.filter = link.dataset.filter;
    state.query = "";
    state.page = "home";
  }
  if (link.dataset.jump) state.filter = null;
  go(link.dataset.nav);
  if (link.dataset.jump) document.getElementById("cats")?.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = document.getElementById("search-input").value.trim();
  state.filter = null;
  go("home");
});

window.addEventListener("hashchange", () => {
  const page = location.hash.replace("#", "") || "home";
  if (["home", "build", "bundles", "performance"].includes(page)) {
    state.page = page;
    render();
  }
});

fetch("../zid/catalog.json")
  .then((res) => res.json())
  .then((catalog) => {
    state.catalog = catalog;
    const page = location.hash.replace("#", "");
    if (["build", "bundles", "performance"].includes(page)) state.page = page;
    render();
  })
  .catch(() => {
    app.innerHTML = `<div class="panel empty">تعذر تحميل قائمة المنتجات المحلية.</div>`;
  });
