const store = new Map();

const productosStorage = {
  getAll: () => Array.from(store.values()),
  getById: (id) => store.get(id) || null,
  create: (item) => { store.set(item.id, item); return item; },
  update: (id, data) => {
    const item = store.get(id);
    if (!item) return null;
    const updated = { ...item, ...data };
    store.set(id, updated);
    return updated;
  },
  delete: (id) => { const existed = store.has(id); store.delete(id); return existed; },
  findWhere: (pred) => Array.from(store.values()).filter(pred),
  _store: store,
};

module.exports = productosStorage;
