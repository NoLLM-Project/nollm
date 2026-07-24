// 3_Registry/Routing/tools/routing_auto_refactor_suggestions.js

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
 * Compute signature for a node:
 * - category
 * - out-degree
 * - sorted outgoing targets
 */
function signature(node, graph) {
  const targets = (graph[node] || []).slice().sort();
  return {
    node,
    category: category(node),
    outDegree: targets.length,
    targets
  };
}

/**
 * Jaccard similarity for signature comparison
 */
function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Main: generate refactor suggestions
 */
export function generateRoutingRefactorSuggestions() {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  const sigs = {};
  for (const node of allNodes) {
    sigs[node] = signature(node, graph);
  }

  const suggestions = [];

  // 1. Suggest merging nodes with identical signatures
  const nodes = [...allNodes];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const A = sigs[nodes[i]];
      const B = sigs[nodes[j]];

      if (
        A.category === B.category &&
        A.outDegree === B.outDegree &&
        jaccard(A.targets, B.targets) === 1
      ) {
        suggestions.push({
          type: "merge_candidates",
          nodes: [A.node, B.node],
          reason: "Identical signatures; likely redundant or duplicative."
        });
      }
    }
  }

  // 2. Suggest splitting nodes with extremely high out-degree
  const degrees = nodes.map(n => sigs[n].outDegree);
  const mean =
    degrees.reduce((a, b) => a + b, 0) / (degrees.length || 1);
  const std = Math.sqrt(
    degrees.reduce((acc, d) => acc + (d - mean) ** 2, 0) /
      (degrees.length || 1)
  );

  for (const node of nodes) {
    const s = sigs[node];
    if (s.outDegree > mean + 2 * std && s.outDegree >= 6) {
      suggestions.push({
        type: "split_candidate",
        node,
        reason: `Out-degree ${s.outDegree} is unusually high for category '${s.category}'.`
      });
    }
  }

  // 3. Suggest removing transitions that are unique outliers
  const boundaryCounts = {};
  for (const t of transitions) {
    if (!t.target) continue;
    const key = `${category(t.source)}→${category(t.target)}`;
    boundaryCounts[key] = (boundaryCounts[key] || 0) + 1;
  }

  const totalBoundaries = Object.values(boundaryCounts).reduce(
    (a, b) => a + b,
    0
  );

  if (totalBoundaries > 0) {
    for (const t of transitions) {
      if (!t.target) continue;
      const key = `${category(t.source)}→${category(t.target)}`;
      const pct = boundaryCounts[key] / totalBoundaries;

      if (pct < 0.01) {
        suggestions.push({
          type: "remove_transition_candidate",
          transition: t,
          reason: `Boundary '${key}' is extremely rare (${(pct * 100).toFixed(
            2
          )}%).`
        });
      }
    }
  }

  // 4. Suggest canonicalizing nodes with similar but not identical signatures
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const A = sigs[nodes[i]];
      const B = sigs[nodes[j]];

      if (A.category === B.category) {
        const sim = jaccard(A.targets, B.targets);
        if (sim >= 0.5 && sim < 1) {
          suggestions.push({
            type: "canonicalization_candidate",
            nodes: [A.node, B.node],
            similarity: sim,
            reason: `Nodes share similar transition patterns (similarity ${sim.toFixed(
              2
            )}).`
          });
        }
      }
    }
  }

  return suggestions;
}

/**
 * Pretty-print refactor suggestions
 */
export function printRoutingRefactorSuggestions() {
  const suggestions = generateRoutingRefactorSuggestions();

  console.log("\n=== ROUTING AUTO-REFACTOR SUGGESTIONS ===\n");

  if (suggestions.length === 0) {
    console.log("No refactor suggestions. Structure appears stable.\n");
    return;
  }

  for (const s of suggestions) {
    console.log(`Type: ${s.type}`);
    console.log(`Reason: ${s.reason}`);

    if (s.nodes) console.log(`Nodes: ${s.nodes.join(", ")}`);
    if (s.node) console.log(`Node: ${s.node}`);
    if (s.transition)
      console.log(
        `Transition: ${s.transition.source} → ${s.transition.target}`
      );
    if (s.similarity !== undefined)
      console.log(`Similarity: ${s.similarity.toFixed(2)}`);

    console.log("");
  }

  console.log("=== END ===\n");
}
