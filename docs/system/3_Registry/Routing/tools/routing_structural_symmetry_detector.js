// 3_Registry/Routing/tools/routing_structural_symmetry_detector.js

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
 * Compute a structural signature for each node.
 * Signature includes:
 * - sorted outgoing targets
 * - count of outgoing edges
 * - category prefix
 */
function computeSignatures(graph) {
  const signatures = {};

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

  for (const [node, targets] of Object.entries(graph)) {
    const sortedTargets = targets.slice().sort();
    signatures[node] = {
      category: category(node),
      degree: sortedTargets.length,
      targets: sortedTargets
    };
  }

  return signatures;
}

/**
 * Compare two signatures for symmetry.
 * Symmetry means:
 * - same degree
 * - same category
 * - similar target patterns (Jaccard similarity)
 */
function symmetryScore(sigA, sigB) {
  if (sigA.category !== sigB.category) return 0;
  if (sigA.degree !== sigB.degree) return 0;

  const A = new Set(sigA.targets);
  const B = new Set(sigB.targets);

  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;

  return union === 0 ? 1 : intersection / union;
}

/**
 * Detect symmetric node pairs.
 */
export function detectStructuralSymmetry() {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);
  const signatures = computeSignatures(graph);

  const nodes = Object.keys(signatures);
  const pairs = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const A = nodes[i];
      const B = nodes[j];

      const score = symmetryScore(signatures[A], signatures[B]);
      if (score >= 0.6) {
        pairs.push({
          nodeA: A,
          nodeB: B,
          score
        });
      }
    }
  }

  return { signatures, pairs };
}

/**
 * Pretty-print symmetry report.
 */
export function printStructuralSymmetryReport() {
  const { pairs } = detectStructuralSymmetry();

  console.log("\n=== ROUTING STRUCTURAL SYMMETRY REPORT ===\n");

  if (pairs.length === 0) {
    console.log("No significant structural symmetry detected.");
    console.log("\n=== END ===\n");
    return;
  }

  let index = 1;
  for (const p of pairs) {
    console.log(
      `Pair ${index}: ${p.nodeA} ↔ ${p.nodeB} (symmetry score: ${p.score.toFixed(2)})`
    );
    index++;
  }

  console.log("\nHigh symmetry score → nodes behave structurally alike.");
  console.log("Low symmetry score  → nodes diverge in structure.");
  console.log("\n=== END ===\n");
}
