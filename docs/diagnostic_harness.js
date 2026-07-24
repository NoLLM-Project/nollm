// diagnostic_harness.js
import { runEnvelope } from "./system_engine.js";

async function test(envelope) {
  console.log("=== INPUT ENVELOPE ===");
  console.log(JSON.stringify(envelope, null, 2));

  const output = await runEnvelope(envelope);

  console.log("=== OUTPUT ===");
  console.log(JSON.stringify(output, null, 2));
}

// Load a test envelope
import envelope from "./test_envelopes/basic_test.json" assert { type: "json" };

test(envelope);
