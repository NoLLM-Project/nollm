// surfaces/ui/pipeline/send_message.js
// Build envelope → call runner adapter → deliver output back to UI.

import { buildEnvelope } from "./build_envelope.js";
import { receiveMessage } from "./receive_message.js";

export async function sendMessage(text) {

  // 1. Build the envelope (message + tag)
  const envelope = buildEnvelope(text);

  // 2. Call the runner adapter instead of runWorkflow
  window.__system_handleEnvelope(envelope, (systemText) => {
    // 3. Deliver system output back into UI
    receiveMessage(systemText);
  });
}
