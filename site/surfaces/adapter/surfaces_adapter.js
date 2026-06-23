// surfaces/adapter/surfaces_adapter.js
// Minimal Surfaces-plane adapter.
// It only emits an envelope outward and receives a text reply.
// It does NOT import anything from system/.

export const surfacesAdapter = {
  sendEnvelope(envelope, onReply) {
    // This function does nothing except hand the envelope
    // to whatever receives Surfaces-plane messages.
    //
    // You will fill in the "transport" later.
    // For now, it is a pure outward emission.

    if (typeof window.handleEnvelopeFromSurfaces === "function") {
      window.handleEnvelopeFromSurfaces(envelope, onReply);
    } else {
      console.warn("No system-plane receiver is registered.");
    }
  }
};
