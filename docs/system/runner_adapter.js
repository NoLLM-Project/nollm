// system/runner_adapter.js
// Minimal async receiver for Surfaces → System

import { runWorkflow } from "./runner.js";

// ------------------------------------------------------------
// Minimal async handler
// ------------------------------------------------------------
export async function handleEnvelopeAsync(envelope) {
  const initialPayload = envelope;
  const userToken = envelope.tag?.user_id || null;

  try {
    const workflowContext = await runWorkflow(initialPayload, userToken);
    return JSON.stringify(workflowContext, null, 2);
  } catch (err) {
    // Minimal clean error propagation
    return `System Error: ${err.message || err}`;
  }
}

// ------------------------------------------------------------
// Expose receiver to ui.js (no imports from ui.js)
// ------------------------------------------------------------
window.__system_handleEnvelope = async function (envelope, resolve) {
  const output = await handleEnvelopeAsync(envelope);
  resolve(output);
};
