/* ============================================================
   CLASP & CO — product data
   Placeholder prices/descriptions — swap in real inventory and
   photography when ready. Prices shown in BDT.
   ============================================================ */
window.CLASP_PRODUCTS = {
  categories: [
    { id: "bags-women", label: "Women's Bags" },
    { id: "bags-men", label: "Men's Bags" },
    { id: "wallets", label: "Wallets & Small Goods" },
    { id: "wearables", label: "Belts & Wearables" },
  ],
  items: {
    "bags-women": [
      { name: "The Everyday Tote", desc: "Full-grain leather, brass hardware, fits a 14\" laptop.", price: 6800, icon: "tote" },
      { name: "The Crossbody Mini", desc: "Adjustable strap, magnetic clasp, room for the essentials.", price: 4200, icon: "cross" },
      { name: "The Weekend Bag", desc: "Waxed canvas with leather trim, one strap, no fuss.", price: 8500, icon: "duffel" },
    ],
    "bags-men": [
      { name: "The Commuter Backpack", desc: "Water-resistant canvas, leather base, padded laptop sleeve.", price: 7200, icon: "backpack" },
      { name: "The Messenger", desc: "Structured, laptop-safe, sits flat instead of slouching.", price: 6500, icon: "messenger" },
      { name: "The Travel Duffel", desc: "Full-grain leather, reinforced base, carry-on sized.", price: 9200, icon: "duffel" },
    ],
    wallets: [
      { name: "Slim Bifold", desc: "RFID-safe, six card slots, no bulk in your pocket.", price: 1800, icon: "wallet" },
      { name: "Cardholder", desc: "Minimal, four card slots, fits in a palm.", price: 1200, icon: "card" },
      { name: "Zip Pouch", desc: "Coin and card pouch, brass zip pull.", price: 1500, icon: "pouch" },
    ],
    wearables: [
      { name: "Classic Leather Belt", desc: "Solid brass buckle, full-grain strap, resizable.", price: 2200, icon: "belt" },
      { name: "Reversible Belt", desc: "Two finishes in one strap — black and tan.", price: 2600, icon: "belt" },
      { name: "Woven Bracelet", desc: "Braided leather with a brass clasp, unisex sizing.", price: 900, icon: "bracelet" },
    ],
  },
};

window.CLASP_ICONS = {
  tote: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 24c0-10 6-16 14-16s14 6 14 16" /><rect x="12" y="24" width="40" height="30" rx="4"/></svg>`,
  cross: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="18" y="26" width="28" height="24" rx="4"/><path d="M20 26 12 8M44 26l8-18"/></svg>`,
  duffel: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="10" y="22" width="44" height="26" rx="10"/><path d="M22 22v-4a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4"/><path d="M6 32h4M54 32h4"/></svg>`,
  backpack: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="14" y="18" width="36" height="38" rx="8"/><path d="M22 18v-2a10 10 0 0 1 20 0v2"/><rect x="24" y="28" width="16" height="12" rx="2"/></svg>`,
  messenger: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="10" y="26" width="44" height="24" rx="4"/><path d="M10 26 32 34 54 26"/><path d="M16 26 50 10"/></svg>`,
  wallet: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="10" y="18" width="44" height="30" rx="5"/><path d="M10 28h44"/><circle cx="46" cy="23" r="1.6" fill="currentColor" stroke="none"/></svg>`,
  card: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="14" y="20" width="36" height="24" rx="4"/><path d="M14 28h36"/></svg>`,
  pouch: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 26c0-8 8-12 18-12s18 4 18 12v10c0 8-8 12-18 12s-18-4-18-12z"/><path d="M18 26h28"/></svg>`,
  belt: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="8" y="28" width="48" height="8" rx="2"/><rect x="22" y="22" width="10" height="20" rx="2"/><circle cx="27" cy="32" r="1.4" fill="currentColor" stroke="none"/></svg>`,
  bracelet: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="32" cy="32" rx="20" ry="12"/><path d="M14 32c4-4 8-6 18-6s14 2 18 6"/></svg>`,
};
