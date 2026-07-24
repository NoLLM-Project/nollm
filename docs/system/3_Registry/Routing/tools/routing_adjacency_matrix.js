// 3_Registry/Routing/tools/routing_adjacency_matrix.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Build an adjacency matrix for the routing graph.
 * Returns:
 * {
 *   nodes: [...],
 *   matrix: [[0,1,0,...], ...]
 * }
 */
export function generateAdjacencyMatrix() {
  const { transitions } = loadRoutingRegistry();

  // Collect all unique nodes
  const sources = transitions.map(t => t.source);
  const targets = transitions.map(t => t.target).filter(Boolean);
  const nodes = Array.from(new Set([...sources, ...targets])).sort();

  // Initialize matrix
  const size = nodes.length;
  const matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  );

  // Fill matrix
  for (const t of transitions) {
    if (!t.target) continue;

    const row = nodes.indexOf(t.source);
    const col = nodes.indexOf(t.target);

    if (row !== -1 && col !== -1) {
      matrix[row][col] = 1;
    }
  }

  return { nodes, matrix };
}

/**
 * Pretty-print the adjacency matrix in ASCII form.
 */
export function printAdjacencyMatrix() {
  const { nodes, matrix } = generateAdjacencyMatrix();

  console.log("\n=== ROUTING ADJACENCY MATRIX ===\n");

  // Header row
  const header = ["       "].concat(nodes.map(n => n.padEnd(6))).join("");
  console.log(header);

  // Rows
  for (let i = 0; i < nodes.length; i++) {
    const rowLabel = nodes[i].padEnd(7);
    const rowValues = matrix[i].map(v => String(v).padEnd(6)).join("");
    console.log(rowLabel + rowValues);
  }

  console.log("\n=== END OF MATRIX ===\n");
}
