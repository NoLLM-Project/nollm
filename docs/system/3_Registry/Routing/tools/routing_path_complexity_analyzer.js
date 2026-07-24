// 3_Registry/Routing/tools/routing_path_complexity_analyzer.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Build adjacency list for DFS.
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
 * Enumerate ALL paths from start → target.
 * Cycle-safe: avoids revisiting nodes in the current path.
 */
function enumeratePaths(start, target, graph) {
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
      if (!path.includes(next)) dfs(next);
    }

    path.pop();
  }

  dfs(start);
  return allPaths;
}

/**
 * Compute complexity metrics for a single path.
 */
function analyzePath(path, graph) {
  const length = path.length - 1;

  // Branching factor: average number of outgoing edges along the path
  let totalBranches = 0;
  for (const node of path) {
    totalBranches += (graph[node] || []).length;
  }
  const branchingFactor = totalBranches / path.length;

  // Semantic hops: category changes along the path
  const category = n => {
    if (n.startsWith("world_")) return "world";
    if (n.startsWith("hotel_")) return "hotel";
    if (n.startsWith("floor_")) return "floors";
    if (n.startsWith("room_")) return "rooms";
    if (n.startsWith("ui_")) return "ui";
    if (n.startsWith("scene_")) return "scenes";
    if (n.startsWith("service_")) return "service";
    if (n.startsWith("error_")) return "errors";
    if (n.startsWith("sm_")) return "state_machine";
    return "unknown";
  };

  let semanticHops = 0;
  for (let i = 0; i < path.length - 1; i++) {
    if (category(path[i]) !== category(path[i + 1])) {
      semanticHops++;
    }
  }

  // Complexity score (tunable)
  const complexityScore =
    length * 1.0 +
    branchingFactor * 0.8 +
    semanticHops * 1.2;

  return {
    length,
    branchingFactor,
    semanticHops,
    complexityScore
  };
}

/**
 * Analyze all paths between start → target.
 */
export function analyzePathComplexity(start, target) {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const paths = enumeratePaths(start, target, graph);
  const results = [];

  for (const p of paths) {
    results.push({
      path: p,
      metrics: analyzePath(p, graph)
    });
  }

  return results;
}

/**
 * Pretty-print complexity analysis.
 */
export function printPathComplexityReport(start, target) {
  const results = analyzePathComplexity(start, target);

  console.log(`\n=== PATH COMPLEXITY REPORT: ${start} → ${target} ===`);

  if (results.length === 0) {
    console.log("No paths found.");
    console.log("=== END ===\n");
    return;
  }

  let index = 1;
  for (const r of results) {
    const { length, branchingFactor, semanticHops, complexityScore } = r.metrics;

    console.log(`\nPath ${index}:`);
    console.log("  " + r.path.join(" → "));
    console.log(`  Length:          ${length}`);
    console.log(`  Branching factor: ${branchingFactor.toFixed(2)}`);
    console.log(`  Semantic hops:    ${semanticHops}`);
    console.log(`  Complexity score: ${complexityScore.toFixed(2)}`);

    // Warnings
    if (length > 8) console.log("  ⚠ Long path");
    if (branchingFactor > 3) console.log("  ⚠ High branching");
    if (semanticHops > 4) console.log("  ⚠ Excessive semantic hops");
    if (complexityScore > 12) console.log("  ⚠ High complexity score");

    index++;
  }

  console.log(`\nTotal paths analyzed: ${results.length}`);
  console.log("\n=== END ===\n");
}
