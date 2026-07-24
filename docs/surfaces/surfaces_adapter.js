// surfaces_adapter
export const surfacesAdapter = {
  sendEnvelope(envelope, onReply) {
    const fn = window.__system_handleEnvelope;
    if (typeof fn === "function") {
      fn(envelope, onReply);
    } else {
      console.warn("System-plane handler not registered yet.");
    }
  }
};
