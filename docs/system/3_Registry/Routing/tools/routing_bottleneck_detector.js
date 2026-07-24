// 3_Registry/Routing/tools/routing_bottleneck_detector.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Build adjacency list.
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
 * Enumerate all simple paths from start to any reachable node.
 * (Cycle-safe: no revisits in current path.)
 */
function enumerateAllPathsFrom(start, graph) {
  const allPaths = [];
  const path = [];

  function dfs(node) {
    path.push(node);
    allPaths.push([...path]);

    const neighbors = graph[node] || [];
    for (const next of neighbors) {
      if (!path.includes(next)) dfs(next);
    }

    path.pop();
  }

  dfs(start);
  return allPaths;
}

/**
 * Compute bottleneck scores:
 * - For each node, count how many paths it appears in (excluding as sole node).
 */
export function detectRoutingBottlenecks() {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  const counts = {};
  for (const n of allNodes) counts[n] = 0;

  for (const start of allNodes) {
    const paths = enumerateAllPathsFrom(start, graph);

    for (const p of paths) {
      if (p.length <= 1) continue;
      for (const node of p) {
        counts[node]++;
      }
    }
  }

  return counts;
}

/**
 * Pretty-print bottlenecks sorted by score.
 */
export function printRoutingBottleneckReport() {
  const counts = detectRoutingBottlenecks();

  console.log("\n=== ROUTING BOTTLENECK REPORT ===\n");

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  for (const [node, score] of entries) {
    console.log(`${node.padEnd(25)} : ${String(score).padStart(5)} path appearances`);
  }

  console.log("\nTop candidates are your likely bottlenecks.");
  console.log("\n=== END OF REPORT ===\n");
}
