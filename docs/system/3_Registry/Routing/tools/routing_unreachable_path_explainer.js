// 3_Registry/Routing/tools/routing_unreachable_path_explainer.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Build adjacency list for BFS.
 */
function buildGraph(transitions) {
  const graph = {};
  for (const t of transitions) {
    if (!graph[t.source]) graph[t.source] = [];
    if (t.target) graph[t.source].push(t.target);
  }
  return graph;
}

/**
 * BFS to find reachable nodes from a given start.
 */
function bfs(start, graph) {
  const visited = new Set();
  const queue = [start];

  while (queue.length > 0) {
    const node = queue.shift();
    if (visited.has(node)) continue;

    visited.add(node);

    const neighbors = graph[node] || [];
    for (const n of neighbors) {
      if (!visited.has(n)) queue.push(n);
    }
  }

  return visited;
}

/**
 * Explain why a target node is unreachable from a given start node.
 * Returns:
 * {
 *   start,
 *   target,
 *   reachable: [...],
 *   unreachable: [...],
 *   breakpoints: [...],
 *   missingTransitions: [...],
 *   possibleCauses: [...]
 * }
 */
export function explainUnreachablePath(start, target) {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const reachable = bfs(start, graph);

  const explanation = {
    start,
    target,
    reachable: Array.from(reachable),
    unreachable: [],
    breakpoints: [],
    missingTransitions: [],
    possibleCauses: []
  };

  // If target IS reachable, no issue
  if (reachable.has(target)) {
    explanation.possibleCauses.push("Target is reachable. No path issue detected.");
    return explanation;
  }

  // Identify unreachable nodes
  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  for (const node of allNodes) {
    if (!reachable.has(node)) {
      explanation.unreachable.push(node);
    }
  }

  // Identify breakpoints: nodes that SHOULD lead to target but don't
  for (const node of reachable) {
    const outgoing = graph[node] || [];
    if (outgoing.length === 0) continue;

    // If any outgoing neighbor is unreachable, this is a breakpoint
    for (const neighbor of outgoing) {
      if (!reachable.has(neighbor)) {
        explanation.breakpoints.push({
          node,
          missingLink: neighbor
        });
      }
    }
  }

  // Identify missing transitions that would fix the path
  explanation.missingTransitions = explanation.breakpoints.map(bp => ({
    from: bp.node,
    to: bp.missingLink,
    suggestion: `Add transition: ${bp.node} → ${bp.missingLink}`
  }));

  // Possible causes
  explanation.possibleCauses.push("Missing transition between reachable and unreachable nodes.");
  explanation.possibleCauses.push("Category file may be incomplete.");
  explanation.possibleCauses.push("Node may be orphaned or mis‑categorized.");
  explanation.possibleCauses.push("Routing split may have dropped a transition.");
  explanation.possibleCauses.push("Semantic rules may forbid the required transition.");

  return explanation;
}

/**
 * Pretty-print unreachable path explanation.
 */
export function printUnreachablePathExplanation(start, target) {
  const result = explainUnreachablePath(start, target);

  console.log(`\n=== UNREACHABLE PATH EXPLANATION: ${start} → ${target} ===`);

  if (result.reachable.includes(target)) {
    console.log("Target IS reachable. No issues detected.");
    console.log("=== END ===\n");
    return;
  }

  console.log("\nReachable nodes:");
  console.log(result.reachable.join(", "));

  console.log("\nUnreachable nodes:");
  console.log(result.unreachable.join(", "));

  console.log("\nBreakpoints (where the path fails):");
  result.breakpoints.forEach(bp =>
    console.log(` - ${bp.node} → ${bp.missingLink} (missing transition)`)
  );

  console.log("\nSuggested missing transitions:");
  result.missingTransitions.forEach(mt =>
    console.log(` - ${mt.suggestion}`)
  );

  console.log("\nPossible causes:");
  result.possibleCauses.forEach(c => console.log(" -", c));

  console.log("\n=== END OF REPORT ===\n");
}
