// system/adapter/system_receiver.js
// Minimal System-plane receiver.
// It receives an envelope from Surfaces-plane and runs the System-plane workflow.
// It does NOT import anything from surfaces/.

import { coord_front_desk } from "../3_Coord/coord_front_desk.js";

// Expose a single entry point for Surfaces-plane.
window.handleEnvelopeFromSurfaces = function (envelope, onReply) {

  // 1. Pass envelope into the System-plane front desk.
  coord_front_desk(envelope, (finalText) => {

    // 2. Return the final text back to Surfaces-plane.
    onReply(finalText);
  });
};
