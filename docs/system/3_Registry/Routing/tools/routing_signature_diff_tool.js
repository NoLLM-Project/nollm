// 3_Registry/Routing/tools/routing_signature_diff_tool.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Category helper
 */
function category(node) {
  if (!node) return "unknown";
  if (node.startsWith("world_")) return "world";
  if (node.startsWith("hotel_")) return "hotel";
  if (node.startsWith("floor_")) return "floors";
  if (node.startsWith("room_")) return "rooms";
  if (node.startsWith("ui_")) return "ui";
  if (node.startsWith("scene_")) return "scenes";
  if (node.startsWith("service_")) return "service";
  if (node.startsWith("error_")) return "errors";
  if (node.startsWith("sm_")) return "state_machine";
  return "unknown";
}

/**
 * Build adjacency list
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
 * Build a signature for a node:
 * - category
 * - out-degree
 * - sorted outgoing targets
 */
function buildSignature(node, graph) {
  const targets = (graph[node] || []).slice().sort();
  return {
    node,
    category: category(node),
    outDegree: targets.length,
    targets
  };
}

/**
 * Diff two signatures
 */
function diffSignatures(sigA, sigB) {
  const added = sigB.targets.filter(t => !sigA.targets.includes(t));
  const removed = sigA.targets.filter(t => !sigB.targets.includes(t));

  const categoryChanged = sigA.category !== sigB.category;
  const degreeChanged = sigA.outDegree !== sigB.outDegree;

  return {
    nodeA: sigA.node,
    nodeB: sigB.node,
    categoryChanged,
    degreeChanged,
    added,
    removed
  };
}

/**
 * Main API: diff signatures for two nodes
 */
export function diffRoutingSignatures(nodeA, nodeB) {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const sigA = buildSignature(nodeA, graph);
  const sigB = buildSignature(nodeB, graph);

  return diffSignatures(sigA, sigB);
}

/**
 * Pretty-print signature diff
 */
export function printRoutingSignatureDiff(nodeA, nodeB) {
  const diff = diffRoutingSignatures(nodeA, nodeB);

  console.log(`\n=== ROUTING SIGNATURE DIFF: ${nodeA} ↔ ${nodeB} ===\n`);

  if (diff.categoryChanged) {
    console.log(`Category changed: ${diff.nodeA} (${diff.nodeA.category}) → ${diff.nodeB} (${diff.nodeB.category})`);
  } else {
    console.log(`Category: ${diff.nodeA} and ${diff.nodeB} share category '${diff.category}'`);
  }

  if (diff.degreeChanged) {
    console.log(`Out-degree changed: ${diff.nodeA}=${diff.removed.length + diff.added.length} vs ${diff.nodeB}`);
  }

  console.log("\nAdded transitions:");
  if (diff.added.length === 0) console.log("  (none)");
  else diff.added.forEach(t => console.log(`  + ${t}`));

  console.log("\nRemoved transitions:");
  if (diff.removed.length === 0) console.log("  (none)");
  else diff.removed.forEach(t => console.log(`  - ${t}`));

  console.log("\n=== END ===\n");
}
