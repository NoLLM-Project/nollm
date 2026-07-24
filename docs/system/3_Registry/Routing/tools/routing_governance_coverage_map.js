// 3_Registry/Routing/tools/routing_governance_coverage_map.js

import { loadRoutingRegistry } from "../loader.js";
import { validateRoutingInvariants } from "./routing_invariant_validator.js";

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
 * Build a coverage map:
 * - which invariants apply to which nodes
 * - which invariants apply to which boundaries
 * - which nodes/edges have no governance
 */
export function computeGovernanceCoverageMap(invariants) {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  const nodeCoverage = {};
  const boundaryCoverage = {};

  // Initialize coverage
  for (const node of allNodes) {
    nodeCoverage[node] = [];
  }

  for (const t of transitions) {
    if (!t.target) continue;
    const key = `${t.source}→${t.target}`;
    boundaryCoverage[key] = [];
  }

  // Apply invariants to coverage
  for (const inv of invariants) {
    if (inv.type === "degree_range_by_category") {
      const cat = inv.rule.category;
      for (const node of allNodes) {
        if (category(node) === cat) {
          nodeCoverage[node].push(inv);
        }
      }
    }

    if (inv.type === "common_boundary" || inv.type === "rare_boundary") {
      const boundary = inv.rule.boundary;
      for (const t of transitions) {
        if (!t.target) continue;
        const srcCat = category(t.source);
        const dstCat = category(t.target);
        const key = `${srcCat}→${dstCat}`;
        if (key === boundary) {
          boundaryCoverage[`${t.source}→${t.target}`].push(inv);
        }
      }
    }
  }

  // Identify ungoverned nodes and boundaries
  const ungovernedNodes = Object.entries(nodeCoverage)
    .filter(([_, invs]) => invs.length === 0)
    .map(([node]) => node);

  const ungovernedBoundaries = Object.entries(boundaryCoverage)
    .filter(([_, invs]) => invs.length === 0)
    .map(([edge]) => edge);

  return {
    nodeCoverage,
    boundaryCoverage,
    ungovernedNodes,
    ungovernedBoundaries
  };
}

/**
 * Pretty-print governance coverage map
 */
export function printGovernanceCoverageMap(invariants) {
  const {
    nodeCoverage,
    boundaryCoverage,
    ungovernedNodes,
    ungovernedBoundaries
  } = computeGovernanceCoverageMap(invariants);

  console.log("\n=== GOVERNANCE COVERAGE MAP ===\n");

  console.log("Nodes with governance:");
  for (const [node, invs] of Object.entries(nodeCoverage)) {
    if (invs.length > 0) {
      console.log(` - ${node}: ${invs.length} invariants`);
    }
  }
  console.log("");

  console.log("Boundaries with governance:");
  for (const [edge, invs] of Object.entries(boundaryCoverage)) {
    if (invs.length > 0) {
      console.log(` - ${edge}: ${invs.length} invariants`);
    }
  }
  console.log("");

  console.log("Ungoverned nodes:");
  if (ungovernedNodes.length === 0) console.log(" - (none)");
  else ungovernedNodes.forEach(n => console.log(` - ${n}`));
  console.log("");

  console.log("Ungoverned boundaries:");
  if (ungovernedBoundaries.length === 0) console.log(" - (none)");
  else ungovernedBoundaries.forEach(b => console.log(` - ${b}`));
  console.log("");

  console.log("=== END ===\n");
}
