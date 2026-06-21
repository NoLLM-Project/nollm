// ui/state/event_bus.js
// Minimal event bus for UI <-> system-plane communication.
// Pure Surface Plane — no coords, no architecture, no semantics.
// The system-plane emits events; the UI listens and updates state.

export const eventBus = {
  listeners: {},

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  },

  emit(eventName, payload) {
    const callbacks = this.listeners[eventName];
    if (!callbacks) return;

    callbacks.forEach(cb => cb(payload));
  }
};
