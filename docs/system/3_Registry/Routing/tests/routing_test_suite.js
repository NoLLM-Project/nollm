import { loadRoutingRegistry } from "../loader.js";
import { validateRoutingEntry } from "../routing_validator.js";
import { checkRoutingInvariants } from "../routing_invariants.js";
import { validateRoutingSemantics } from "../tools/routing_semantic_validator.js";

export async function runRoutingTests() {
  console.log("=== Running Routing Test Suite ===");

  // 1. Load routing schema via fetch (MIME-safe)
  const routingSchema = await fetch("/3_Registry/Routing/routing_schema.json")
    .then(r => r.json())
    .catch(err => {
      console.error("❌ Failed to load routing_schema.json");
      throw err;
    });

  // 2. Load routing transitions
  const routing = loadRoutingRegistry();
  const transitions = routing.transitions;

  console.log(`Loaded ${transitions.length} routing transitions.`);

  // 3. Validate each entry against schema
  for (const entry of transitions) {
    try {
      validateRoutingEntry(entry, routingSchema);
    } catch (err) {
      console.error(`❌ Schema validation failed for ${entry.id}`);
      throw err;
    }
  }
  console.log("✔ Schema validation passed.");

  // 4. Legacy invariant checks
  try {
    checkRoutingInvariants(transitions);
  } catch (err) {
    console.error("❌ Legacy invariant check failed.");
    throw err;
  }
  console.log("✔ Legacy invariant checks passed.");

  // 5. Semantic routing validation (R21)
  const semanticErrors = validateRoutingSemantics();
  if (semanticErrors.length > 0) {
    console.error("❌ Semantic routing validation failed.");
    for (const e of semanticErrors) {
      console.error(`- [${e.type}] ${e.message}`);
      if (e.entry) console.error("  Entry:", e.entry);
      if (e.node) console.error("  Node:", e.node);
    }
    throw new Error("Semantic routing validation failed.");
  }
  console.log("✔ Semantic routing validation passed.");

  // 6. Check for duplicate IDs
  const ids = new Set();
  for (const entry of transitions) {
    if (ids.has(entry.id)) {
      throw new Error(`❌ Duplicate routing ID detected: ${entry.id}`);
    }
    ids.add(entry.id);
  }
  console.log("✔ No duplicate IDs.");

  // 7. Check for unreachable transitions
  const sources = new Set(transitions.map(t => t.source));
  const targets = new Set(transitions.map(t => t.target).filter(Boolean));

  const unreachable = [...targets].filter(t => !sources.has(t));
  if (unreachable.length > 0) {
    console.warn("⚠ Warning: Unreachable routing targets detected:");
    unreachable.forEach(t => console.warn("  - " + t));
  } else {
    console.log("✔ No unreachable targets.");
  }

  console.log("=== Routing Test Suite Complete ===");
}
