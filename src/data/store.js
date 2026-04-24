const fs = require('fs');
const path = require('path');

function createStore(filename) {
  const filepath = path.join(__dirname, filename);

  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '[]');
  }

  return {
    getAll() {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    },
    getById(id) {
      return this.getAll().find(item => item.id === id) || null;
    },
    create(item) {
      const data = this.getAll();
      data.push(item);
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      return item;
    },
    update(id, updates) {
      const data = this.getAll();
      const i = data.findIndex(item => item.id === id);
      if (i === -1) return null;
      data[i] = { ...data[i], ...updates };
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      return data[i];
    },
    delete(id) {
      const data = this.getAll();
      const i = data.findIndex(item => item.id === id);
      if (i === -1) return false;
      data.splice(i, 1);
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      return true;
    },
    findWhere(predicate) {
      return this.getAll().filter(predicate);
    },
  };
}

module.exports = createStore;
