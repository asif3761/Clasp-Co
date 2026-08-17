(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const yearEl = document.getElementById("year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const WHATSAPP_NUMBER = "8800000000000"; // TODO: replace with your real number
  const BKASH_NUMBER_PLACEHOLDER = "— add your bKash merchant number here —";
  const fmt = (n) => "\u09f3" + n.toLocaleString("en-US");

  /* ---------------------------------------------------------
     Toasts
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
     Shop — tabs + item rendering, with a fold transition on
     category switch (leather-page-turn, not a plain re-render)
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

  function cardHTML(item){
    return `
      <article class="p-card" data-id="${item.id}">
        <div class="icon">${window.CLASP_ICONS[item.icon]}</div>
        <h3>${item.name}</h3>
        <p class="p-desc">${item.desc}</p>
        <div class="p-foot">
          <span class="price">${fmt(item.price)}</span>
          <button type="button" class="btn-mini" data-action="add-to-cart" data-id="${item.id}">Add to Bag</button>
        </div>
      </article>`;
  }

  function renderGrid(){
    const items = window.CLASP_PRODUCTS.items[currentCat] || [];
    gridEl.innerHTML = items.map(cardHTML).join("");
    requestAnimationFrame(() => {
      gridEl.querySelectorAll(".p-card").forEach((el, i) => {
        setTimeout(() => el.classList.add("in"), i * 60);
      });
    });
  }

  function switchCategory(catId){
    if(catId === currentCat || !gridEl.children.length){
      currentCat = catId;
      renderTabs();
      renderGrid();
      return;
    }
    gridEl.classList.add("folding");
    setTimeout(() => {
      currentCat = catId;
      renderTabs();
      const items = window.CLASP_PRODUCTS.items[currentCat] || [];
      gridEl.classList.remove("folding");
      gridEl.innerHTML = items.map(cardHTML).join("");
      gridEl.querySelectorAll(".p-card").forEach((el, i) => {
        el.classList.add("fold-in");
        el.style.animationDelay = (i * 0.05) + "s";
      });
    }, 320);
  }

  renderTabs();
  renderGrid();

  tabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".shop-tab");
    if(!btn) return;
    switchCategory(btn.dataset.cat);
  });

  gridEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='add-to-cart']");
    if(!btn) return;
    window.ClaspCart.add(btn.dataset.id, 1);
    const item = findProduct(btn.dataset.id);
    toast(`Added ${item ? item.name : "item"} to your bag`);
    stitchBurst(e.clientX, e.clientY);
  });

  function findProduct(id){
    for(const cat of Object.keys(window.CLASP_PRODUCTS.items)){
      const found = window.CLASP_PRODUCTS.items[cat].find(p => p.id === id);
      if(found) return found;
    }
    return null;
  }

  /* ---------------------------------------------------------
     Cart drawer
  --------------------------------------------------------- */
  const cartToggle = document.getElementById("cart-toggle");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartClose = document.getElementById("cart-close");
  const cartCount = document.getElementById("cart-count");
  const cartItemsEl = document.getElementById("cart-items");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartView = document.getElementById("cart-view");
  const checkoutView = document.getElementById("checkout-view");
  const checkoutBack = document.getElementById("checkout-back");
  const checkoutSummary = document.getElementById("checkout-summary");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  function openCart(){
    cartOverlay.classList.add("open");
    cartDrawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeCart(){
    cartOverlay.classList.remove("open");
    cartDrawer.classList.remove("open");
    document.body.style.overflow = "";
    showCartView();
  }
  function showCartView(){
    cartView.classList.remove("hidden");
    checkoutView.classList.remove("open");
  }
  function showCheckoutView(){
    const items = window.ClaspCart.detailed();
    if(items.length === 0){ toast("Your bag is empty"); return; }
    checkoutSummary.innerHTML = items.map(i =>
      `<div style="display:flex;justify-content:space-between;"><span>${i.qty}&times; ${i.name}</span><span>${fmt(i.lineTotal)}</span></div>`
    ).join("") + `<div style="display:flex;justify-content:space-between;font-weight:600;margin-top:6px;padding-top:6px;border-top:1px solid var(--line);"><span>Total</span><span>${fmt(window.ClaspCart.subtotal())}</span></div>`;
    cartView.classList.add("hidden");
    checkoutView.classList.add("open");
  }

  cartToggle?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);
  checkoutBtn?.addEventListener("click", showCheckoutView);
  checkoutBack?.addEventListener("click", showCartView);

  function renderCart(){
    const items = window.ClaspCart.detailed();
    cartCount.textContent = window.ClaspCart.count();
    cartCount.style.display = window.ClaspCart.count() > 0 ? "flex" : "none";

    if(items.length === 0){
      cartItemsEl.innerHTML = `<p class="cart-empty">Your bag is empty. Add something worth carrying.</p>`;
    } else {
      cartItemsEl.innerHTML = items.map(i => `
        <div class="cart-row" data-id="${i.id}">
          <div class="cart-row-icon">${window.CLASP_ICONS[i.icon]}</div>
          <div>
            <div class="cart-row-name">${i.name}</div>
            <div class="cart-row-meta">
              <div class="qty-stepper">
                <button type="button" data-action="dec" data-id="${i.id}">&minus;</button>
                <span>${i.qty}</span>
                <button type="button" data-action="inc" data-id="${i.id}">&plus;</button>
              </div>
              <button type="button" class="cart-row-remove" data-action="remove" data-id="${i.id}" aria-label="Remove">&times;</button>
            </div>
          </div>
          <span class="cart-row-total">${fmt(i.lineTotal)}</span>
        </div>`).join("");
    }
    cartSubtotalEl.textContent = fmt(window.ClaspCart.subtotal());
  }
  window.ClaspCart.onChange(renderCart);
  renderCart();

  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if(!btn) return;
    const id = btn.dataset.id;
    const items = window.ClaspCart.getItems();
    const current = items.find(i => i.id === id);
    const qty = current ? current.qty : 1;
    if(btn.dataset.action === "inc") window.ClaspCart.setQty(id, qty + 1);
    if(btn.dataset.action === "dec") window.ClaspCart.setQty(id, qty - 1);
    if(btn.dataset.action === "remove") window.ClaspCart.remove(id);
  });

  document.getElementById("checkout-view").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = (fd.get("name") || "").toString().trim();
    const phone = (fd.get("phone") || "").toString().trim();
    const address = (fd.get("address") || "").toString().trim();
    const notes = (fd.get("notes") || "").toString().trim();
    if(!name || !phone || !address){ toast("Please fill in your name, phone and address"); return; }

    const items = window.ClaspCart.detailed();
    const orderId = "CC-" + Date.now().toString(36).toUpperCase().slice(-5);
    const subtotal = window.ClaspCart.subtotal();
    const waText = encodeURIComponent(
      `Order ${orderId} — CLASP & CO\n` +
      items.map(i => `${i.qty}x ${i.name} — ${fmt(i.lineTotal)}`).join("\n") +
      `\nTotal: ${fmt(subtotal)}\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}` +
      (notes ? `\nNotes: ${notes}` : "") +
      `\n\nSend payment via bKash to ${BKASH_NUMBER_PLACEHOLDER} using ${orderId} as reference, then I'll confirm here.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, "_blank", "noopener");
    window.ClaspCart.clear();
    closeCart();
    toast(`Order ${orderId} — opening WhatsApp to confirm`);
    e.target.reset();
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

  /* ---------------------------------------------------------
     Themed custom cursor: brass dot + dashed ring, with a
     trailing "stitch" mark left along the path
  --------------------------------------------------------- */
  const cursorDot = document.getElementById("cursor-dot");
  const cursorRing = document.getElementById("cursor-ring");

  if(isFinePointer && !reduceMotion && cursorDot && cursorRing){
    let mx = 0, my = 0, rx = 0, ry = 0;
    let lastStitch = 0;
    let lastStitchPos = { x: 0, y: 0 };

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.left = mx + "px";
      cursorDot.style.top = my + "px";

      const hoverTarget = e.target.closest("a, button, .p-card, input[type='submit']");
      cursorDot.classList.toggle("hover", !!hoverTarget);
      cursorRing.classList.toggle("hover", !!hoverTarget);

      // lay a stitch mark every ~26px of travel, oriented along the
      // direction of movement — like a needle tracking across leather
      const dx = mx - lastStitchPos.x, dy = my - lastStitchPos.y;
      const dist = Math.hypot(dx, dy);
      const now = performance.now();
      if(dist > 26 && now - lastStitch > 30){
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const mark = document.createElement("div");
        mark.className = "stitch-mark";
        mark.style.left = mx + "px";
        mark.style.top = my + "px";
        mark.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
        document.body.appendChild(mark);
        setTimeout(() => mark.remove(), 650);
        lastStitch = now;
        lastStitchPos = { x: mx, y: my };
      }
    });

    function tick(){
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.left = rx + "px";
      cursorRing.style.top = ry + "px";
      requestAnimationFrame(tick);
    }
    tick();
  }

  // manual burst of stitch marks around a point (add-to-cart feedback)
  function stitchBurst(x, y){
    if(reduceMotion) return;
    for(let i = 0; i < 6; i++){
      const angle = (i / 6) * Math.PI * 2;
      const mark = document.createElement("div");
      mark.className = "stitch-mark";
      mark.style.left = (x + Math.cos(angle) * 18) + "px";
      mark.style.top = (y + Math.sin(angle) * 18) + "px";
      mark.style.transform = `translate(-50%,-50%) rotate(${angle * (180/Math.PI)}deg)`;
      mark.style.background = "var(--accent)";
      document.body.appendChild(mark);
      setTimeout(() => mark.remove(), 650);
    }
  }

  /* ---------------------------------------------------------
     Magnetic buttons — nudge toward the cursor within range
  --------------------------------------------------------- */
  if(isFinePointer && !reduceMotion){
    const MAGNET_RANGE = 60;
    const MAGNET_STRENGTH = 0.25;
    document.addEventListener("mousemove", (e) => {
      document.querySelectorAll(".btn-primary, .btn-ghost").forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if(dist < MAGNET_RANGE + rect.width/2){
          btn.style.setProperty("--mgx", (dx * MAGNET_STRENGTH) + "px");
          btn.style.setProperty("--mgy", (dy * MAGNET_STRENGTH) + "px");
        } else {
          btn.style.setProperty("--mgx", "0px");
          btn.style.setProperty("--mgy", "0px");
        }
      });
    });
  }

  /* ---------------------------------------------------------
     3D hero medallion
  --------------------------------------------------------- */
  if(window.ClaspScene) window.ClaspScene.init();

})();
