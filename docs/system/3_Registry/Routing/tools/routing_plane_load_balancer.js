// 3_Registry/Routing/tools/routing_plane_load_balancer.js

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
 * Compute plane-level load:
 * - node count
 * - total out-degree
 * - average out-degree
 * - boundary traffic
 */
function computePlaneLoads(transitions, graph) {
  const planeStats = {};

  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  // Initialize
  for (const node of allNodes) {
    const cat = category(node);
    if (!planeStats[cat]) {
      planeStats[cat] = {
        nodes: [],
        totalOutDegree: 0,
        boundariesOut: {},
        boundariesIn: {}
      };
    }
    planeStats[cat].nodes.push(node);
  }

  // Compute out-degree and boundaries
  for (const node of allNodes) {
    const cat = category(node);
    const out = graph[node] || [];
    planeStats[cat].totalOutDegree += out.length;

    for (const target of out) {
      const dstCat = category(target);
      const key = `${cat}→${dstCat}`;

      planeStats[cat].boundariesOut[key] =
        (planeStats[cat].boundariesOut[key] || 0) + 1;

      planeStats[dstCat].boundariesIn[key] =
        (planeStats[dstCat].boundariesIn[key] || 0) + 1;
    }
  }

  // Compute averages
  for (const [plane, stats] of Object.entries(planeStats)) {
    const count = stats.nodes.length;
    stats.avgOutDegree = count === 0 ? 0 : stats.totalOutDegree / count;
  }

  return planeStats;
}

/**
 * Generate suggestions for balancing load across planes.
 */
export function generatePlaneLoadBalanceSuggestions() {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);
  const planeStats = computePlaneLoads(transitions, graph);

  const suggestions = [];

  // 1. Identify overloaded planes (high avg out-degree)
  const avgDegrees = Object.values(planeStats).map(p => p.avgOutDegree);
  const mean =
    avgDegrees.reduce((a, b) => a + b, 0) / (avgDegrees.length || 1);
  const std = Math.sqrt(
    avgDegrees.reduce((acc, d) => acc + (d - mean) ** 2, 0) /
      (avgDegrees.length || 1)
  );

  for (const [plane, stats] of Object.entries(planeStats)) {
    if (stats.avgOutDegree > mean + 1.5 * std) {
      suggestions.push({
        type: "overloaded_plane",
        plane,
        avgOutDegree: stats.avgOutDegree,
        reason: `Plane '${plane}' has unusually high average out-degree (${stats.avgOutDegree.toFixed(
          2
        )}).`
      });
    }
  }

  // 2. Identify underutilized planes
  for (const [plane, stats] of Object.entries(planeStats)) {
    if (stats.avgOutDegree < mean - 1.5 * std) {
      suggestions.push({
        type: "underutilized_plane",
        plane,
        avgOutDegree: stats.avgOutDegree,
        reason: `Plane '${plane}' has unusually low average out-degree (${stats.avgOutDegree.toFixed(
          2
        )}).`
      });
    }
  }

  // 3. Suggest moving nodes from overloaded → underutilized planes
  const overloaded = suggestions
    .filter(s => s.type === "overloaded_plane")
    .map(s => s.plane);

  const underutilized = suggestions
    .filter(s => s.type === "underutilized_plane")
    .map(s => s.plane);

  for (const srcPlane of overloaded) {
    for (const dstPlane of underutilized) {
      suggestions.push({
        type: "redistribution_candidate",
        from: srcPlane,
        to: dstPlane,
        reason: `Consider moving some nodes from '${srcPlane}' to '${dstPlane}' to balance load.`
      });
    }
  }

  // 4. Suggest reducing rare boundary traffic
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
    for (const [boundary, count] of Object.entries(boundaryCounts)) {
      const pct = count / totalBoundaries;
      if (pct < 0.01) {
        suggestions.push({
          type: "boundary_cleanup_candidate",
          boundary,
          reason: `Boundary '${boundary}' is extremely rare (${(pct * 100).toFixed(
            2
          )}%). Consider consolidating or removing transitions.`
        });
      }
    }
  }

  return suggestions;
}

/**
 * Pretty-print plane load balance suggestions
 */
export function printPlaneLoadBalanceSuggestions() {
  const suggestions = generatePlaneLoadBalanceSuggestions();

  console.log("\n=== PLANE LOAD BALANCER SUGGESTIONS ===\n");

  if (suggestions.length === 0) {
    console.log("No load balancing suggestions. Plane distribution appears stable.\n");
    return;
  }

  for (const s of suggestions) {
    console.log(`Type: ${s.type}`);
    console.log(`Reason: ${s.reason}`);

    if (s.plane) console.log(`Plane: ${s.plane}`);
    if (s.from) console.log(`From: ${s.from}`);
    if (s.to) console.log(`To: ${s.to}`);
    if (s.boundary) console.log(`Boundary: ${s.boundary}`);

    console.log("");
  }

  console.log("=== END ===\n");
}
