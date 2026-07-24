// 3_Registry/Routing/tools/routing_dev_tools.js

// Core loader + validation
import { loadRoutingRegistry } from "../loader.js";
import { validateRoutingEntry } from "../routing_validator.js";
import { checkRoutingInvariants } from "../routing_invariants.js";
import routingSchema from "../routing.schema.json";

// Tools
import { diffRoutingGraphs, diffAgainstFile } from "./routing_diff.js";
import { visualizeRoutingGraphASCII, visualizeRoutingGraphJSON } from "./routing_graph_visualizer.js";

// Test suite
import { runRoutingTests } from "../tests/routing_test_suite.js";

/**
 * Run a full routing validation pass:
 * - load routing
 * - validate schema
 * - check invariants
 * - print summary
 */
export function runValidationPass() {
  console.log("=== Routing Validation Pass ===");

  const routing = loadRoutingRegistry();
  const transitions = routing.transitions;

  console.log(`Loaded ${transitions.length} transitions.`);

  // Schema validation
  for (const entry of transitions) {
    validateRoutingEntry(entry, routingSchema);
  }
  console.log("✔ Schema validation passed.");

  // Invariants
  checkRoutingInvariants(transitions);
  console.log("✔ Invariant checks passed.");

  console.log("=== Validation Complete ===");
}

/**
 * Run the ASCII graph visualizer.
 */
export function showGraph() {
  visualizeRoutingGraphASCII();
}

/**
 * Return the JSON graph structure.
 */
export function getGraphJSON() {
  return visualizeRoutingGraphJSON();
}

/**
 * Diff the current routing graph against a saved JSON file.
 */
export function diffWithOld(filePath) {
  const result = diffAgainstFile(filePath);

  console.log("=== Routing Diff Report ===");
  console.log("Added:", result.added.length);
  console.log("Removed:", result.removed.length);
  console.log("Modified:", result.modified.length);
  console.log("Unchanged:", result.unchanged.length);

  return result;
}

/**
 * Run the full routing test suite.
 */
export function runTests() {
  runRoutingTests();
}
