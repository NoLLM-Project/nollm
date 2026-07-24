// 3_Registry/Routing/tools/routing_graph_visualizer.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * ASCII visualizer for the routing graph.
 * Groups transitions by source node and prints them in a readable tree.
 */
export function visualizeRoutingGraphASCII() {
  const { transitions } = loadRoutingRegistry();

  const bySource = {};
  for (const t of transitions) {
    if (!bySource[t.source]) bySource[t.source] = [];
    bySource[t.source].push(t);
  }

  console.log("=== ROUTING GRAPH (ASCII VIEW) ===");

  for (const source of Object.keys(bySource).sort()) {
    console.log(`\n${source}`);
    console.log("  ───────────────────────────────");

    for (const t of bySource[source]) {
      const target = t.target ?? "∅";
      console.log(`  • ${t.id}`);
      console.log(`      → ${target}`);
      console.log(`      conditions: ${t.conditions.join(", ")}`);
      console.log(`      transitions: ${t.transitions.join(", ")}`);
    }
  }

  console.log("\n=== END OF GRAPH ===");
}

/**
 * JSON visualizer: returns a structured JSON representation
 * grouped by source node.
 */
export function visualizeRoutingGraphJSON() {
  const { transitions } = loadRoutingRegistry();

  const bySource = {};
  for (const t of transitions) {
    if (!bySource[t.source]) bySource[t.source] = [];
    bySource[t.source].push(t);
  }

  return bySource;
}
