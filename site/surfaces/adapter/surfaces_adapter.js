// surfaces/adapter/surfaces_adapter.js
// Surfaces-plane adapter that matches your runner adapter.
// It calls window.__system_handleEnvelope exactly as your system exposes it.

export const surfacesAdapter = {
  sendEnvelope(envelope, onReply) {
    const fn = window.__system_handleEnvelope;

    if (typeof fn === "function") {
      fn(envelope, onReply);
    } else {
      console.warn("System-plane receiver (__system_handleEnvelope) is not registered.");
    }
  }
};
