/* ============================================================
   CLASP & CO — cart
   localStorage-backed cart. No payment gateway: checkout hands
   the order to WhatsApp + manual bKash instructions.
   ============================================================ */
window.ClaspCart = (() => {
  const KEY = "clasp-cart";
  const listeners = [];

  function read(){
    try{ return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch(e){ return []; }
  }
  function write(items){
    localStorage.setItem(KEY, JSON.stringify(items));
    listeners.forEach(fn => fn(items));
  }
  function findProduct(id){
    for(const cat of Object.keys(window.CLASP_PRODUCTS.items)){
      const found = window.CLASP_PRODUCTS.items[cat].find(p => p.id === id);
      if(found) return found;
    }
    return null;
  }

  return {
    onChange(fn){ listeners.push(fn); },
    getItems(){ return read(); },

    add(id, qty = 1){
      const items = read();
      const existing = items.find(i => i.id === id);
      if(existing) existing.qty += qty;
      else items.push({ id, qty });
      write(items);
    },
    setQty(id, qty){
      let items = read();
      if(qty <= 0){ items = items.filter(i => i.id !== id); }
      else {
        const existing = items.find(i => i.id === id);
        if(existing) existing.qty = qty;
      }
      write(items);
    },
    remove(id){ write(read().filter(i => i.id !== id)); },
    clear(){ write([]); },
    count(){ return read().reduce((sum, i) => sum + i.qty, 0); },

    detailed(){
      return read().map(i => {
        const p = findProduct(i.id);
        return p ? { ...p, qty: i.qty, lineTotal: p.price * i.qty } : null;
      }).filter(Boolean);
    },
    subtotal(){ return this.detailed().reduce((sum, i) => sum + i.lineTotal, 0); },
  };
})();
