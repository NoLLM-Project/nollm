// 3_Registry/Routing/tools/routing_global_reachability_map.js

import { loadRoutingRegistry } from "../loader.js";

function buildGraph(transitions) {
  const graph = {};
  for (const t of transitions) {
    if (!graph[t.source]) graph[t.source] = [];
    if (t.target) graph[t.source].push(t.target);
  }
  return graph;
}

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
 * Build a global reachability map:
 * {
 *   [node]: {
 *     reachable: [...],
 *     count: number
 *   }
 * }
 */
export function generateGlobalReachabilityMap() {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  const map = {};

  for (const node of allNodes) {
    const reachable = bfs(node, graph);
    reachable.delete(node); // exclude self if you want pure outward reach
    map[node] = {
      reachable: Array.from(reachable).sort(),
      count: reachable.size
    };
  }

  return map;
}

/**
 * Pretty-print a compact global reachability summary.
 */
export function printGlobalReachabilitySummary() {
  const map = generateGlobalReachabilityMap();

  console.log("\n=== GLOBAL REACHABILITY MAP (SUMMARY) ===\n");

  const entries = Object.entries(map).sort(
    (a, b) => b[1].count - a[1].count
  );

  for (const [node, info] of entries) {
    console.log(`${node.padEnd(25)} → ${String(info.count).padStart(3)} reachable nodes`);
  }

  console.log("\n=== END OF SUMMARY ===\n");
}
