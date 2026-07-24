// 3_Registry/Routing/tools/routing_path_redundancy_analyzer.js

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
 * Enumerate ALL simple paths from start → target.
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
 * Compute redundancy metrics for a set of paths.
 */
function analyzeRedundancy(paths) {
  if (paths.length === 0) {
    return {
      pathCount: 0,
      redundancyScore: 0,
      classification: "none",
      nodeFrequency: {}
    };
  }

  // Count how often each node appears across all paths
  const nodeFrequency = {};
  for (const p of paths) {
    for (const node of p) {
      nodeFrequency[node] = (nodeFrequency[node] || 0) + 1;
    }
  }

  // Redundancy score:
  // Higher = more overlapping paths
  // Lower = more unique paths
  let overlap = 0;
  for (const freq of Object.values(nodeFrequency)) {
    if (freq > 1) overlap += freq - 1;
  }

  const redundancyScore = overlap / paths.length;

  let classification = "normal";
  if (paths.length === 1) classification = "low";
  else if (redundancyScore > 4) classification = "high";

  return {
    pathCount: paths.length,
    redundancyScore,
    classification,
    nodeFrequency
  };
}

/**
 * Main API: analyze redundancy between start → target.
 */
export function analyzePathRedundancy(start, target) {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const paths = enumeratePaths(start, target, graph);
  const metrics = analyzeRedundancy(paths);

  return { start, target, paths, metrics };
}

/**
 * Pretty-print redundancy analysis.
 */
export function printPathRedundancyReport(start, target) {
  const { paths, metrics } = analyzePathRedundancy(start, target);

  console.log(`\n=== PATH REDUNDANCY REPORT: ${start} → ${target} ===`);

  if (paths.length === 0) {
    console.log("No paths found.");
    console.log("=== END ===\n");
    return;
  }

  console.log(`\nTotal paths: ${metrics.pathCount}`);
  console.log(`Redundancy score: ${metrics.redundancyScore.toFixed(2)}`);
  console.log(`Classification: ${metrics.classification}`);

  console.log("\nNode frequency across all paths:");
  for (const [node, freq] of Object.entries(metrics.nodeFrequency)) {
    console.log(` - ${node}: ${freq} occurrences`);
  }

  console.log("\nPaths:");
  let index = 1;
  for (const p of paths) {
    console.log(` ${index}. ${p.join(" → ")}`);
    index++;
  }

  console.log("\n=== END ===\n");
}
