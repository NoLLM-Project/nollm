// 3_Registry/Routing/tools/routing_invariants_auto_generator.js

import { loadRoutingRegistry } from "../loader.js";

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

function buildGraph(transitions) {
  const graph = {};
  for (const t of transitions) {
    if (!graph[t.source]) graph[t.source] = [];
    if (t.target) graph[t.source].push(t.target);
  }
  return graph;
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function std(values, m) {
  if (!values.length) return 0;
  const v =
    values.reduce((acc, x) => acc + (x - m) * (x - m), 0) / values.length;
  return Math.sqrt(v);
}

/**
 * Auto-generate invariants from observed patterns.
 */
export function generateRoutingInvariants() {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  // Per-node stats
  const nodeStats = {};
  const catOutDegrees = {};
  const boundaryCounts = {};

  for (const node of allNodes) {
    const cat = category(node);
    const outTargets = (graph[node] || []).filter(Boolean);
    const outDegree = outTargets.length;

    nodeStats[node] = { category: cat, outDegree, targets: outTargets };

    if (!catOutDegrees[cat]) catOutDegrees[cat] = [];
    catOutDegrees[cat].push(outDegree);
  }

  // Category-level degree patterns
  const catStats = {};
  for (const [cat, vals] of Object.entries(catOutDegrees)) {
    const m = mean(vals);
    const s = std(vals, m);
    catStats[cat] = { mean: m, std: s };
  }

  // Boundary patterns
  for (const t of transitions) {
    if (!t.target) continue;
    const srcCat = category(t.source);
    const dstCat = category(t.target);
    const key = `${srcCat}→${dstCat}`;
    boundaryCounts[key] = (boundaryCounts[key] || 0) + 1;
  }

  const totalBoundaries = Object.values(boundaryCounts).reduce(
    (a, b) => a + b,
    0
  );

  const invariants = [];

  // Invariant type 1: typical out-degree per category
  for (const [cat, stats] of Object.entries(catStats)) {
    if (stats.mean === 0 && stats.std === 0) continue;
    const min = Math.max(0, Math.floor(stats.mean - 2 * stats.std));
    const max = Math.ceil(stats.mean + 2 * stats.std);

    invariants.push({
      type: "degree_range_by_category",
      category: cat,
      description: `Nodes in category '${cat}' typically have out-degree in [${min}, ${max}].`,
      rule: {
        category: cat,
        minOutDegree: min,
        maxOutDegree: max
      }
    });
  }

  // Invariant type 2: common boundaries (allowed / expected)
  if (totalBoundaries > 0) {
    for (const [key, count] of Object.entries(boundaryCounts)) {
      const pct = count / totalBoundaries;
      if (pct >= 0.05) {
        invariants.push({
          type: "common_boundary",
          boundary: key,
          description: `Boundary '${key}' is common (${(pct * 100).toFixed(
            1
          )}% of cross-plane transitions) and should likely remain allowed.`,
          rule: {
            boundary: key,
            status: "allowed"
          }
        });
      }
    }
  }

  // Invariant type 3: rare boundaries (suspicious)
  if (totalBoundaries > 0) {
    for (const [key, count] of Object.entries(boundaryCounts)) {
      const pct = count / totalBoundaries;
      if (pct > 0 && pct < 0.01) {
        invariants.push({
          type: "rare_boundary",
          boundary: key,
          description: `Boundary '${key}' is rare (${(pct * 100).toFixed(
            2
          )}% of cross-plane transitions) and should be reviewed or discouraged.`,
          rule: {
            boundary: key,
            status: "discouraged"
          }
        });
      }
    }
  }

  return invariants;
}

/**
 * Pretty-print proposed invariants.
 */
export function printRoutingInvariantsProposal() {
  const invariants = generateRoutingInvariants();

  console.log("\n=== ROUTING INVARIANTS AUTO-GENERATOR (PROPOSAL) ===\n");

  if (invariants.length === 0) {
    console.log("No invariants inferred from current registry.");
    console.log("\n=== END ===\n");
    return;
  }

  let index = 1;
  for (const inv of invariants) {
    console.log(`Invariant ${index}:`);
    console.log(`  Type: ${inv.type}`);
    console.log(`  ${inv.description}`);
    console.log("");
    index++;
  }

  console.log("These are proposals, not enforced rules. Promote selected ones into your formal invariants set.");
  console.log("\n=== END ===\n");
}
