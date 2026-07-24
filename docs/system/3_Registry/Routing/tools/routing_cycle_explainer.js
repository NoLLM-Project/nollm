// 3_Registry/Routing/tools/routing_cycle_explainer.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Detect cycles and explain them.
 * Returns a list of cycle objects:
 * {
 *   nodes: [...],
 *   transitions: [...],
 *   type: "self" | "two_node" | "multi_node"
 * }
 */
export function explainRoutingCycles() {
  const { transitions } = loadRoutingRegistry();

  // Build adjacency list
  const graph = {};
  for (const t of transitions) {
    if (!graph[t.source]) graph[t.source] = [];
    if (t.target) graph[t.source].push({ target: t.target, id: t.id });
  }

  const visited = new Set();
  const stack = [];
  const cycles = [];

  function dfs(node) {
    if (stack.includes(node)) {
      // Cycle detected
      const cycleStartIndex = stack.indexOf(node);
      const cycleNodes = stack.slice(cycleStartIndex);
      const cycleTransitions = [];

      // Collect transitions forming the cycle
      for (let i = cycleStartIndex; i < stack.length - 1; i++) {
        const src = stack[i];
        const dst = stack[i + 1];
        const t = transitions.find(t => t.source === src && t.target === dst);
        if (t) cycleTransitions.push(t.id);
      }

      // Close the loop
      const last = stack[stack.length - 1];
      const t = transitions.find(t => t.source === last && t.target === node);
      if (t) cycleTransitions.push(t.id);

      // Determine cycle type
      let type = "multi_node";
      if (cycleNodes.length === 1) type = "self";
      if (cycleNodes.length === 2) type = "two_node";

      cycles.push({
        nodes: cycleNodes,
        transitions: cycleTransitions,
        type
      });

      return;
    }

    if (visited.has(node)) return;
    visited.add(node);

    stack.push(node);

    const outgoing = graph[node] || [];
    for (const edge of outgoing) {
      dfs(edge.target);
    }

    stack.pop();
  }

  // Run DFS from every node
  for (const node of Object.keys(graph)) {
    dfs(node);
  }

  return cycles;
}

/**
 * Pretty-print cycle explanations.
 */
export function printRoutingCycleReport() {
  const cycles = explainRoutingCycles();

  console.log("\n=== ROUTING CYCLE REPORT ===");

  if (cycles.length === 0) {
    console.log("No cycles detected.");
    console.log("=== END ===\n");
    return;
  }

  for (const cycle of cycles) {
    console.log("\nCycle detected:");
    console.log("Type:", cycle.type);
    console.log("Nodes:", cycle.nodes.join(" → ") + " → " + cycle.nodes[0]);
    console.log("Transitions:", cycle.transitions.join(", "));
  }

  console.log("\n=== END OF REPORT ===\n");
}
