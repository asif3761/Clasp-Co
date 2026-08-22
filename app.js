/* ============================================================
   CLASP & CO — app
   Hash router with a signature "leather page-turn" transition:
   two panels fold in from the left/right, meet in the middle
   with a stamped emblem, content swaps, then they fold back open.
   ============================================================ */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const app = document.getElementById("app");
  const overlay = document.getElementById("page-transition");
  const panelLeft = overlay.querySelector(".fold-left");
  const panelRight = overlay.querySelector(".fold-right");
  const stamp = overlay.querySelector(".fold-stamp");
  const yearEl = document.getElementById("year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const WHATSAPP_NUMBER = "8800000000000"; // TODO: replace with your real number
  const BKASH_NUMBER_PLACEHOLDER = "— add your bKash merchant number here —";
  const fmt = (n) => "\u09f3" + n.toLocaleString("en-US");

  /* ---------------------------------------------------------
     Shared spring-physics utility (stiffness/damping per frame) —
     reused by the magnetic buttons and the cart drawer, so every
     "springy" interaction on the site runs on the same math.
  --------------------------------------------------------- */
  class Spring{
    constructor(stiffness = 0.18, damping = 0.72){
      this.pos = 0; this.vel = 0; this.target = 0;
      this.stiffness = stiffness; this.damping = damping;
    }
    update(){
      const force = (this.target - this.pos) * this.stiffness;
      this.vel = (this.vel + force) * this.damping;
      this.pos += this.vel;
      return this.pos;
    }
    settled(threshold = 0.5){
      return Math.abs(this.target - this.pos) < threshold && Math.abs(this.vel) < threshold;
    }
  }

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
     Shared fragments
  --------------------------------------------------------- */
  function marqueeHTML(){
    const words = ["Full-grain leather", "&middot;", "Solid brass hardware", "&middot;", "Hand-stitched", "&middot;", "Lifetime repair", "&middot;"];
    const line = words.map(w => `<span>${w}</span>`).join("");
    return `<div class="marquee"><div class="marquee-track">${line}${line}</div></div>`;
  }

  function findProduct(id){
    for(const cat of Object.keys(window.CLASP_PRODUCTS.items)){
      const found = window.CLASP_PRODUCTS.items[cat].find(p => p.id === id);
      if(found) return found;
    }
    return null;
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

  /* ---------------------------------------------------------
     VIEWS
  --------------------------------------------------------- */
  function viewHome(){
    const teaser = window.CLASP_PRODUCTS.categories.map(cat => window.CLASP_PRODUCTS.items[cat.id][0]);
    return `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow reveal">For women. For men. For everyday carry.</p>
          <h1 class="hero-title reveal">Carry it well.</h1>
          <p class="hero-sub reveal">Full-grain leather bags, wallets and everyday wearables — built to be used, priced to be lived in, not locked away.</p>
          <div class="hero-actions reveal">
            <a href="#/shop" data-route="/shop" class="btn-primary">Shop the Edit</a>
            <a href="#/craft" data-route="/craft" class="btn-ghost">See how it's made</a>
          </div>
        </div>
        <div class="hero-art reveal" aria-hidden="true">
          <svg viewBox="0 0 420 420" class="bag-illustration">
            <ellipse class="shadow" cx="210" cy="368" rx="128" ry="16"/>
            <path class="strap" d="M120 150 C120 70 300 70 300 150" fill="none"/>
            <rect class="body" x="82" y="150" width="256" height="200" rx="18"/>
            <rect class="flap" x="82" y="150" width="256" height="86" rx="18"/>
            <circle class="clasp" cx="210" cy="222" r="12"/>
            <path class="stitch" d="M96 236 H324" stroke-dasharray="4 6"/>
          </svg>
        </div>
      </section>

      ${marqueeHTML()}

      <section class="shop">
        <div class="section-head reveal">
          <span class="section-eyebrow">A Preview</span>
          <h2>One from each shelf.</h2>
          <p class="section-note">A taste of the full edit — see everything on the Shop page.</p>
        </div>
        <div class="shop-grid">${teaser.map(cardHTML).join("")}</div>
        <div style="text-align:center; margin-top:40px;">
          <a href="#/shop" data-route="/shop" class="btn-ghost reveal">See the Full Edit</a>
        </div>
      </section>

      <section class="craft" style="padding-top:0;">
        <div class="craft-copy">
          <span class="section-eyebrow reveal">Our Craft</span>
          <h2 class="reveal">Nothing here is precious. Everything here is proper.</h2>
          <p class="reveal">Full-grain leather, solid brass hardware, hand-stitched by the same small workshop every time.</p>
          <a href="#/craft" data-route="/craft" class="btn-ghost reveal">Read the Full Story</a>
        </div>
        <div class="craft-grid">
          <div class="craft-card reveal"><span class="craft-num">01</span><h3>Full-grain leather</h3><p>Ages instead of wearing out.</p></div>
          <div class="craft-card reveal"><span class="craft-num">02</span><h3>Solid brass</h3><p>Outlasts the strap it's on.</p></div>
        </div>
      </section>`;
  }

  function viewShop(){
    return `
      <section class="shop page-top">
        <div class="section-head reveal">
          <span class="section-eyebrow">Shop the Edit</span>
          <h2>One collection, worn two ways.</h2>
          <p class="section-note">Everything here is designed unisex-first — the pieces flatter differently, not the fit.</p>
        </div>
        <div class="shop-tabs" id="shop-tabs" role="tablist"></div>
        <div class="shop-grid" id="shop-grid"></div>
      </section>`;
  }

  function viewCraft(){
    return `
      <section class="craft page-top">
        <div class="craft-copy">
          <span class="section-eyebrow reveal">Our Craft</span>
          <h2 class="reveal">Nothing here is precious. Everything here is proper.</h2>
          <p class="reveal">We use full-grain leather because it's the only kind that ages instead of wearing out — every scuff becomes part of the piece, not a flaw in it. Hardware is solid brass, not plated, so it doesn't chip or green over time.</p>
          <p class="reveal">Every bag is hand-stitched by the same small workshop, batch after batch — no factory switch, no quiet downgrade once a style takes off.</p>
          <a href="#/contact" data-route="/contact" class="btn-ghost reveal">Ask us anything</a>
        </div>
        <div class="craft-3d reveal" aria-hidden="true">
          <canvas id="hero-3d"></canvas>
          <span class="craft-3d-caption">Drag to turn the mark</span>
        </div>
        <div class="craft-grid">
          <div class="craft-card reveal"><span class="craft-num">01</span><h3>Full-grain leather</h3><p>Sourced, not synthetic. Develops a patina with use instead of peeling.</p></div>
          <div class="craft-card reveal"><span class="craft-num">02</span><h3>Solid brass hardware</h3><p>Buckles and clasps that outlast the strap they're attached to.</p></div>
          <div class="craft-card reveal"><span class="craft-num">03</span><h3>Hand-stitched</h3><p>Saddle-stitched by hand — stronger than a machine lockstitch, and repairable.</p></div>
          <div class="craft-card reveal"><span class="craft-num">04</span><h3>Lifetime repair</h3><p>Send it back any time a strap or seam gives out. We'll fix it, not replace it.</p></div>
        </div>
      </section>`;
  }

  function viewReviews(){
    return `
      <section class="reviews page-top">
        <div class="section-head reveal">
          <span class="section-eyebrow">Reviews</span>
          <h2>Worn daily, not just admired.</h2>
        </div>
        <div class="reviews-grid">
          <div class="review-card reveal"><p>"I bought the Commuter Backpack expecting it to look worse after a year of daily use. It looks better."</p><cite>&mdash; Everyday carry, 14 months in</cite></div>
          <div class="review-card reveal"><p>"First bag I've owned where the price actually matched what's inside it. No inflated 'luxury tax'."</p><cite>&mdash; First-time buyer</cite></div>
          <div class="review-card reveal"><p>"Sent my old belt in for a new buckle after three years. Came back looking newer than I remembered it."</p><cite>&mdash; Repair customer</cite></div>
        </div>
      </section>`;
  }

  function viewContact(){
    return `
      <section class="contact page-top">
        <div class="contact-inner">
          <span class="section-eyebrow reveal">Stay in the Loop</span>
          <h2 class="reveal">New pieces, restocks, and repairs &mdash; straight from us.</h2>
          <form id="newsletter-form" class="newsletter-form reveal">
            <input type="email" name="email" placeholder="you@example.com" required autocomplete="email">
            <button type="submit" class="btn-primary">Subscribe</button>
          </form>
          <div class="contact-links reveal">
            <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener">WhatsApp &#8599;</a>
            <a href="mailto:hello@claspandco.example" target="_blank" rel="noopener">hello@claspandco.example &#8599;</a>
            <a href="#" target="_blank" rel="noopener">Instagram &#8599;</a>
          </div>
        </div>
      </section>`;
  }

  /* ---------------------------------------------------------
     Router
  --------------------------------------------------------- */
  const routes = {
    "/": { render: viewHome, title: "CLASP & CO. — Accessories Worth Reaching For" },
    "/shop": { render: viewShop, title: "Shop — CLASP & CO." },
    "/craft": { render: viewCraft, title: "Our Craft — CLASP & CO." },
    "/reviews": { render: viewReviews, title: "Reviews — CLASP & CO." },
    "/contact": { render: viewContact, title: "Contact — CLASP & CO." },
  };

  function currentPath(){
    const h = location.hash.replace(/^#/, "");
    return routes[h] ? h : "/";
  }

  function setActiveNav(path){
    document.querySelectorAll("[data-route]").forEach(a => {
      a.classList.toggle("active", a.dataset.route === path);
    });
  }

  function render(path){
    const match = routes[path] || routes["/"];
    app.innerHTML = match.render();
    document.title = match.title;
    setActiveNav(path);

    if(path === "/craft"){
      if(window.ClaspScene) window.ClaspScene.init();
    } else if(window.ClaspScene){
      window.ClaspScene.dispose();
    }

    if(path === "/shop") initShop();

    initReveal();
    window.scrollTo(0,0);
  }

  /* ---------------------------------------------------------
     Leather page-turn transition
  --------------------------------------------------------- */
  function transitionTo(path){
    if(reduceMotion){
      render(path);
      return;
    }
    overlay.classList.add("active");
    panelLeft.style.transform = "translateX(0)";
    panelRight.style.transform = "translateX(0)";

    setTimeout(() => {
      stamp.classList.add("show");
    }, 260);

    setTimeout(() => {
      render(path);
      stamp.classList.remove("show");
      panelLeft.style.transform = "translateX(-100%)";
      panelRight.style.transform = "translateX(100%)";
      setTimeout(() => overlay.classList.remove("active"), 520);
    }, 560);
  }

  function goTo(path){
    if(location.hash.replace(/^#/, "") === path){ render(path); return; }
    location.hash = path;
  }

  window.addEventListener("hashchange", () => transitionTo(currentPath()));

  document.addEventListener("click", (e) => {
    const routeEl = e.target.closest("[data-route]");
    if(routeEl){
      e.preventDefault();
      closeMobileNav();
      goTo(routeEl.dataset.route);
    }
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

  /* ---------------------------------------------------------
     Shop page — tabs + item rendering with fold-switch
  --------------------------------------------------------- */
  function initShop(){
    const tabsEl = document.getElementById("shop-tabs");
    const gridEl = document.getElementById("shop-grid");
    if(!tabsEl || !gridEl) return;

    let currentCat = window.CLASP_PRODUCTS.categories[0].id;

    function renderTabs(){
      tabsEl.innerHTML = window.CLASP_PRODUCTS.categories.map(cat => `
        <button type="button" class="shop-tab${cat.id === currentCat ? " active" : ""}" data-cat="${cat.id}">
          ${cat.label}
        </button>`).join("");
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
      if(catId === currentCat){ return; }
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
  }

  // Add-to-cart works from any rendered grid (home teaser or shop page)
  app.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='add-to-cart']");
    if(!btn) return;
    window.ClaspCart.add(btn.dataset.id, 1);
    const item = findProduct(btn.dataset.id);
    toast(`Added ${item ? item.name : "item"} to your bag`);
    stitchBurst(e.clientX, e.clientY);
  });

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
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    springDrawerTo(0);
  }
  function closeCart(){
    cartOverlay.classList.remove("open");
    document.body.style.overflow = "";
    springDrawerTo(cartDrawer.getBoundingClientRect().width || 420, () => {
      cartDrawer.setAttribute("aria-hidden", "true");
    });
    showCartView();
  }

  // Drive the drawer's slide-in/out with real spring physics instead of
  // a flat CSS ease — gives it a slight, natural overshoot-and-settle.
  const drawerSpring = new Spring(0.22, 0.68);
  let drawerRAF = null;
  drawerSpring.pos = drawerSpring.target = (cartDrawer.getBoundingClientRect().width || 420);
  cartDrawer.style.transform = `translateX(${drawerSpring.pos}px)`;

  function springDrawerTo(target, onSettled){
    drawerSpring.target = target;
    if(reduceMotion){
      drawerSpring.pos = target; drawerSpring.vel = 0;
      cartDrawer.style.transform = `translateX(${target}px)`;
      if(onSettled) onSettled();
      return;
    }
    if(drawerRAF) return; // already animating toward the (possibly updated) target
    function tick(){
      const x = drawerSpring.update();
      cartDrawer.style.transform = `translateX(${x}px)`;
      if(drawerSpring.settled(0.4)){
        cartDrawer.style.transform = `translateX(${drawerSpring.target}px)`;
        drawerRAF = null;
        if(onSettled) onSettled();
        return;
      }
      drawerRAF = requestAnimationFrame(tick);
    }
    tick();
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
     Newsletter — stored locally, no backend
  --------------------------------------------------------- */
  document.addEventListener("submit", (e) => {
    if(e.target.id !== "newsletter-form") return;
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
     Magnetic buttons — real spring physics (stiffness/damping per
     frame), the same underlying math libraries like Framer Motion
     use for their spring animations, implemented directly here
     since this site is vanilla JS rather than React.
  --------------------------------------------------------- */
  if(isFinePointer && !reduceMotion){
    const MAGNET_RANGE = 60;
    const MAGNET_STRENGTH = 0.3;

    const springs = new WeakMap();
    function getSprings(btn){
      if(!springs.has(btn)) springs.set(btn, { x: new Spring(0.18, 0.72), y: new Spring(0.18, 0.72) });
      return springs.get(btn);
    }

    let mouseX = -9999, mouseY = -9999;
    document.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    function magnetTick(){
      document.querySelectorAll(".btn-primary, .btn-ghost").forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
        const dx = mouseX - cx, dy = mouseY - cy;
        const dist = Math.hypot(dx, dy);
        const s = getSprings(btn);
        s.x.target = dist < MAGNET_RANGE + rect.width/2 ? dx * MAGNET_STRENGTH : 0;
        s.y.target = dist < MAGNET_RANGE + rect.width/2 ? dy * MAGNET_STRENGTH : 0;
        const x = s.x.update(), y = s.y.update();
        btn.style.setProperty("--mgx", x.toFixed(2) + "px");
        btn.style.setProperty("--mgy", y.toFixed(2) + "px");
      });
      requestAnimationFrame(magnetTick);
    }
    magnetTick();
  }

  /* ---------------------------------------------------------
     Scroll reveal (re-bound after every render)
  --------------------------------------------------------- */
  let io = null;
  function initReveal(){
    const targets = app.querySelectorAll(".reveal:not(.in-view)");
    if(reduceMotion || !("IntersectionObserver" in window)){
      targets.forEach(el => el.classList.add("in-view"));
      return;
    }
    if(io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if(entry.isIntersecting){
          setTimeout(() => entry.target.classList.add("in-view"), (idx % 4) * 80);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    targets.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
     Initial render
  --------------------------------------------------------- */
  render(currentPath());
})();
