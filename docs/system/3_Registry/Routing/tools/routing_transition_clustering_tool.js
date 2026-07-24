// 3_Registry/Routing/tools/routing_transition_clustering_tool.js

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
 * Build a transition signature vector for each node.
 * Vector = sorted list of outgoing targets.
 */
function buildSignatureVectors(graph) {
  const vectors = {};
  for (const [node, targets] of Object.entries(graph)) {
    vectors[node] = targets.slice().sort();
  }
  return vectors;
}

/**
 * Compute Jaccard similarity between two sets.
 */
function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);

  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;

  return union === 0 ? 0 : intersection / union;
}

/**
 * Cluster nodes by similarity threshold.
 */
function clusterNodes(vectors, threshold = 0.4) {
  const nodes = Object.keys(vectors);
  const visited = new Set();
  const clusters = [];

  for (const node of nodes) {
    if (visited.has(node)) continue;

    const cluster = [node];
    visited.add(node);

    for (const other of nodes) {
      if (visited.has(other)) continue;

      const sim = jaccard(vectors[node], vectors[other]);
      if (sim >= threshold) {
        cluster.push(other);
        visited.add(other);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

/**
 * Main API: cluster routing nodes by transition similarity.
 */
export function clusterRoutingTransitions() {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);
  const vectors = buildSignatureVectors(graph);

  const clusters = clusterNodes(vectors, 0.4);

  return { vectors, clusters };
}

/**
 * Pretty-print clustering results.
 */
export function printTransitionClusteringReport() {
  const { vectors, clusters } = clusterRoutingTransitions();

  console.log("\n=== ROUTING TRANSITION CLUSTERING REPORT ===\n");

  let index = 1;
  for (const cluster of clusters) {
    console.log(`Cluster ${index}:`);
    for (const node of cluster) {
      console.log(` - ${node} → [${vectors[node].join(", ")}]`);
    }
    console.log("");
    index++;
  }

  console.log("Clusters group nodes with similar outgoing transition patterns.");
  console.log("\n=== END ===\n");
}
