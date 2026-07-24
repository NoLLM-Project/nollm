// 3_Registry/Routing/tools/routing_path_enumerator.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Build adjacency list for DFS path enumeration.
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
 * Enumerate ALL paths from start → target using DFS.
 * Cycle-safe: tracks visited nodes in the current path.
 */
export function enumeratePaths(start, target) {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const allPaths = [];
  const path = [];

  function dfs(node) {
    path.push(node);

    if (node === target) {
      allPaths.push([...path]);
      path.pop();
      return;
    }

    const neighbors = graph[node] || [];
    for (const next of neighbors) {
      // Avoid cycles by preventing revisiting nodes in the current path
      if (!path.includes(next)) {
        dfs(next);
      }
    }

    path.pop();
  }

  dfs(start);
  return allPaths;
}

/**
 * Pretty-print all paths from A → B.
 */
export function printAllPaths(start, target) {
  const paths = enumeratePaths(start, target);

  console.log(`\n=== ALL ROUTING PATHS: ${start} → ${target} ===`);

  if (paths.length === 0) {
    console.log("No paths found.");
    console.log("=== END ===\n");
    return;
  }

  let index = 1;
  for (const p of paths) {
    console.log(`\nPath ${index}:`);
    console.log("  " + p.join(" → "));
    index++;
  }

  console.log(`\nTotal paths: ${paths.length}`);
  console.log("\n=== END ===\n");
}
