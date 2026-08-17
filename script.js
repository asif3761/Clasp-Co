(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const yearEl = document.getElementById("year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const WHATSAPP_NUMBER = "8800000000000"; // TODO: replace with your real number
  const fmt = (n) => "\u09f3" + n.toLocaleString("en-US");

  /* ---------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------- */
  function initReveal(){
    const targets = document.querySelectorAll(".reveal:not(.in-view)");
    if(reduceMotion || !("IntersectionObserver" in window)){
      targets.forEach(el => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if(entry.isIntersecting){
          setTimeout(() => entry.target.classList.add("in-view"), (idx % 4) * 80);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    targets.forEach(el => io.observe(el));
  }
  initReveal();

  /* ---------------------------------------------------------
     Shop — tabs + item rendering
  --------------------------------------------------------- */
  const tabsEl = document.getElementById("shop-tabs");
  const gridEl = document.getElementById("shop-grid");
  let currentCat = window.CLASP_PRODUCTS.categories[0].id;

  function renderTabs(){
    tabsEl.innerHTML = window.CLASP_PRODUCTS.categories.map(cat => `
      <button type="button" class="shop-tab${cat.id === currentCat ? " active" : ""}" data-cat="${cat.id}">
        ${cat.label}
      </button>`).join("");
  }

  function renderGrid(){
    const items = window.CLASP_PRODUCTS.items[currentCat] || [];
    gridEl.innerHTML = items.map(item => `
      <article class="p-card">
        <div class="icon">${window.CLASP_ICONS[item.icon]}</div>
        <h3>${item.name}</h3>
        <p class="p-desc">${item.desc}</p>
        <div class="p-foot">
          <span class="price">${fmt(item.price)}</span>
          <button type="button" class="btn-mini" data-name="${item.name}" data-price="${item.price}">Enquire</button>
        </div>
      </article>`).join("");
    requestAnimationFrame(() => {
      gridEl.querySelectorAll(".p-card").forEach((el, i) => {
        setTimeout(() => el.classList.add("in"), i * 60);
      });
    });
  }

  renderTabs();
  renderGrid();

  tabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".shop-tab");
    if(!btn || btn.dataset.cat === currentCat) return;
    currentCat = btn.dataset.cat;
    renderTabs();
    renderGrid();
  });

  gridEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-mini");
    if(!btn) return;
    const text = encodeURIComponent(
      `Hi CLASP & CO — I'd like to ask about the ${btn.dataset.name} (${fmt(Number(btn.dataset.price))}).`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener");
  });

  /* ---------------------------------------------------------
     Mobile nav
  --------------------------------------------------------- */
  const menuToggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  function closeMobileNav(){
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  menuToggle?.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  mobileNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMobileNav));

  /* ---------------------------------------------------------
     Newsletter — stored locally, no backend
  --------------------------------------------------------- */
  const toastRoot = document.getElementById("toast-root");
  function toast(msg){
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastRoot.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 400);
    }, 2600);
  }

  document.getElementById("newsletter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    if(!email) return;
    const list = JSON.parse(localStorage.getItem("clasp-subscribers") || "[]");
    if(!list.includes(email)) list.push(email);
    localStorage.setItem("clasp-subscribers", JSON.stringify(list));
    toast("You're on the list — welcome to CLASP & CO.");
    e.target.reset();
  });

  /* ---------------------------------------------------------
     Product card tilt (desktop only)
  --------------------------------------------------------- */
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  if(isFinePointer && !reduceMotion){
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".p-card");
      document.querySelectorAll(".p-card.tilting").forEach(c => {
        if(c !== card){ c.style.transform = ""; c.classList.remove("tilting"); }
      });
      if(!card) return;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.classList.add("tilting");
      card.style.transform = `translateY(-4px) rotateY(${px*8}deg) rotateX(${-py*8}deg)`;
    });
    document.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".p-card");
      if(card && !card.contains(e.relatedTarget)){
        card.style.transform = "";
        card.classList.remove("tilting");
      }
    });
  }

})();
