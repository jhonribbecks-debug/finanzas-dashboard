const listeners = {};

const store = {
  _state: {
    movements: { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    filters: {},
    categories: [],
    accounts: [],
  },

  get(key) {
    return this._state[key];
  },

  set(key, value) {
    this._state[key] = value;
    this.emit(`${key}:updated`, value);
  },

  update(key, partial) {
    this._state[key] = { ...this._state[key], ...partial };
    this.emit(`${key}:updated`, this._state[key]);
  },

  subscribe(event, callback) {
    if (!listeners[event]) listeners[event] = new Set();
    listeners[event].add(callback);
    return () => listeners[event].delete(callback);
  },

  emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach((cb) => cb(data));
    }
  },
};

export { store };
