// 3_Registry/Routing/tools/routing_expansion_predictor.js

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
 * Compute signature for clustering
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
 * Jaccard similarity
 */
function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Main: generate expansion predictions
 */
export function generateRoutingExpansionPredictions() {
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

  // 1. Identify underrepresented categories (planes)
  const categoryCounts = {};
  for (const node of allNodes) {
    const cat = category(node);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const counts = Object.values(categoryCounts);
  const mean =
    counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
  const std = Math.sqrt(
    counts.reduce((acc, c) => acc + (c - mean) ** 2, 0) /
      (counts.length || 1)
  );

  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count < mean - 1.5 * std) {
      suggestions.push({
        type: "underrepresented_plane",
        plane: cat,
        reason: `Plane '${cat}' has unusually few nodes (${count}). Consider adding new nodes here.`
      });
    }
  }

  // 2. Predict missing canonical nodes in clusters
  const nodes = [...allNodes];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const A = sigs[nodes[i]];
      const B = sigs[nodes[j]];

      if (A.category !== B.category) continue;

      const sim = jaccard(A.targets, B.targets);
      if (sim >= 0.7) {
        // If two nodes are similar but not identical, a canonical node may be missing
        if (A.targets.length !== B.targets.length) {
          suggestions.push({
            type: "missing_canonical_node",
            category: A.category,
            nodes: [A.node, B.node],
            reason: `Nodes '${A.node}' and '${B.node}' form a cluster but differ in structure. A canonical node may be missing.`
          });
        }
      }
    }
  }

  // 3. Predict missing intermediate nodes in long chains
  for (const node of nodes) {
    const out = graph[node] || [];
    if (out.length === 1) {
      const mid = out[0];
      const midOut = graph[mid] || [];

      if (midOut.length === 1) {
        const end = midOut[0];
        suggestions.push({
          type: "missing_intermediate_node",
          chain: [node, mid, end],
          reason: `Chain ${node} → ${mid} → ${end} may need an intermediate node for clarity or branching.`
        });
      }
    }
  }

  // 4. Predict missing entry points for high-traffic targets
  const reverse = {};
  for (const t of transitions) {
    if (!t.target) continue;
    if (!reverse[t.target]) reverse[t.target] = [];
    reverse[t.target].push(t.source);
  }

  for (const [target, sources] of Object.entries(reverse)) {
    if (sources.length >= 5) {
      suggestions.push({
        type: "missing_entry_point",
        target,
        sources,
        reason: `Target '${target}' has ${sources.length} incoming transitions. A shared entry node may be missing.`
      });
    }
  }

  // 5. Predict missing exit points for nodes with many outgoing transitions
  for (const node of nodes) {
    const out = graph[node] || [];
    if (out.length >= 6) {
      suggestions.push({
        type: "missing_exit_point",
        node,
        outDegree: out.length,
        reason: `Node '${node}' has ${out.length} outgoing transitions. A shared exit node may be missing.`
      });
    }
  }

  return suggestions;
}

/**
 * Pretty-print expansion predictions
 */
export function printRoutingExpansionPredictions() {
  const suggestions = generateRoutingExpansionPredictions();

  console.log("\n=== ROUTING EXPANSION PREDICTOR ===\n");

  if (suggestions.length === 0) {
    console.log("No expansion opportunities detected. Structure appears complete.\n");
    return;
  }

  for (const s of suggestions) {
    console.log(`Type: ${s.type}`);
    console.log(`Reason: ${s.reason}`);

    if (s.plane) console.log(`Plane: ${s.plane}`);
    if (s.nodes) console.log(`Nodes: ${s.nodes.join(", ")}`);
    if (s.chain) console.log(`Chain: ${s.chain.join(" → ")}`);
    if (s.target) console.log(`Target: ${s.target}`);
    if (s.sources) console.log(`Sources: ${s.sources.join(", ")}`);
    if (s.node) console.log(`Node: ${s.node}`);

    console.log("");
  }

  console.log("=== END ===\n");
}
