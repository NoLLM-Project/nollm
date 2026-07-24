// system_engine.js
import { runWorkflow } from "./system/runner.js";

export async function runEnvelope(envelope) {
  const userToken = envelope?.tag?.user_id || null;

  try {
    const result = await runWorkflow(envelope, userToken);
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

