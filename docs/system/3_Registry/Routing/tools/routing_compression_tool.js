// 3_Registry/Routing/tools/routing_compression_tool.js

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
 * Compute signature for compression:
 * - category
 * - sorted outgoing targets
 */
function signature(node, graph) {
  const targets = (graph[node] || []).slice().sort();
  return {
    node,
    category: category(node),
    targets,
    key: `${category(node)}|${targets.join(",")}`
  };
}

/**
 * Compute Jaccard similarity for near-duplicate detection
 */
function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Main: generate compression suggestions
 */
export function generateRoutingCompressionSuggestions() {
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

  // 1. Exact signature duplicates → compress into canonical node
  const buckets = {};
  for (const node of allNodes) {
    const key = sigs[node].key;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(node);
  }

  for (const [key, nodes] of Object.entries(buckets)) {
    if (nodes.length > 1) {
      suggestions.push({
        type: "exact_compression_candidate",
        nodes,
        canonical: nodes[0],
        reason: `Nodes share identical signatures and can be compressed into canonical node '${nodes[0]}'.`
      });
    }
  }

  // 2. Near-duplicate signatures → compress patterns, not nodes
  const nodeList = [...allNodes];
  for (let i = 0; i < nodeList.length; i++) {
    for (let j = i + 1; j < nodeList.length; j++) {
      const A = sigs[nodeList[i]];
      const B = sigs[nodeList[j]];

      if (A.category !== B.category) continue;

      const sim = jaccard(A.targets, B.targets);
      if (sim >= 0.6 && sim < 1) {
        suggestions.push({
          type: "pattern_compression_candidate",
          nodes: [A.node, B.node],
          similarity: sim,
          reason: `Nodes share similar transition patterns (similarity ${sim.toFixed(
            2
          )}). Consider extracting a shared canonical pattern.`
        });
      }
    }
  }

  // 3. Detect compressible chains (A → B → C where B is trivial)
  for (const node of allNodes) {
    const out = graph[node] || [];
    if (out.length === 1) {
      const mid = out[0];
      const midOut = graph[mid] || [];

      // If mid is a trivial pass-through
      if (midOut.length === 1) {
        suggestions.push({
          type: "chain_compression_candidate",
          chain: [node, mid, midOut[0]],
          reason: `Chain ${node} → ${mid} → ${midOut[0]} is compressible; '${mid}' may be unnecessary.`
        });
      }
    }
  }

  // 4. Detect compressible star patterns (many nodes → same target)
  const reverse = {};
  for (const t of transitions) {
    if (!t.target) continue;
    if (!reverse[t.target]) reverse[t.target] = [];
    reverse[t.target].push(t.source);
  }

  for (const [target, sources] of Object.entries(reverse)) {
    if (sources.length >= 4) {
      suggestions.push({
        type: "star_compression_candidate",
        target,
        sources,
        reason: `Many nodes (${sources.length}) point to '${target}'. Consider introducing a shared canonical entry point.`
      });
    }
  }

  return suggestions;
}

/**
 * Pretty-print compression suggestions
 */
export function printRoutingCompressionSuggestions() {
  const suggestions = generateRoutingCompressionSuggestions();

  console.log("\n=== ROUTING COMPRESSION TOOL ===\n");

  if (suggestions.length === 0) {
    console.log("No compression opportunities detected. Structure appears minimal.\n");
    return;
  }

  for (const s of suggestions) {
    console.log(`Type: ${s.type}`);
    console.log(`Reason: ${s.reason}`);

    if (s.nodes) console.log(`Nodes: ${s.nodes.join(", ")}`);
    if (s.canonical) console.log(`Canonical: ${s.canonical}`);
    if (s.chain) console.log(`Chain: ${s.chain.join(" → ")}`);
    if (s.target) console.log(`Target: ${s.target}`);
    if (s.sources) console.log(`Sources: ${s.sources.join(", ")}`);
    if (s.similarity !== undefined)
      console.log(`Similarity: ${s.similarity.toFixed(2)}`);

    console.log("");
  }

  console.log("=== END ===\n");
}
