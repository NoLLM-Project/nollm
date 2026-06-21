// system/runner_adapter.js
// Thin, pure adapter between Surfaces and your existing runWorkflow engine.
// Surfaces → adapter → runWorkflow → workflowContext → Surfaces.

import { runWorkflow } from "./runner.js";

export const runner = {
  async handleEnvelope(envelope, callback) {

    // Surfaces sends:
    //   envelope = { message, tag }
    //
    // Your engine expects:
    //   runWorkflow(initialPayload, userToken)

    const initialPayload = envelope;
    const userToken = envelope.tag?.user_id || null;

    // Call your real engine (unchanged)
    const workflowContext = await runWorkflow(initialPayload, userToken);

    // Convert workflowContext → string for Surfaces chat bubble
    const finalOutput = JSON.stringify(workflowContext, null, 2);

    // Return to Surfaces
    callback(finalOutput);
  }
};
