// 3_Registry/Routing/tools/routing_invariant_validator.js

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
 * Validate invariants against the registry.
 * 
 * Supported invariant types:
 * - degree_range_by_category
 * - common_boundary (allowed)
 * - rare_boundary (discouraged)
 */
export function validateRoutingInvariants(invariants) {
  const { transitions } = loadRoutingRegistry();
  const graph = buildGraph(transitions);

  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  const results = [];

  // Precompute boundary counts
  const boundaryCounts = {};
  for (const t of transitions) {
    if (!t.target) continue;
    const srcCat = category(t.source);
    const dstCat = category(t.target);
    const key = `${srcCat}→${dstCat}`;
    boundaryCounts[key] = (boundaryCounts[key] || 0) + 1;
  }

  for (const inv of invariants) {
    if (inv.type === "degree_range_by_category") {
      const { category: cat, minOutDegree, maxOutDegree } = inv.rule;

      const violations = [];
      for (const node of allNodes) {
        if (category(node) !== cat) continue;

        const outDegree = (graph[node] || []).length;
        if (outDegree < minOutDegree || outDegree > maxOutDegree) {
          violations.push({ node, outDegree });
        }
      }

      results.push({
        invariant: inv,
        status: violations.length === 0 ? "pass" : "fail",
        violations
      });
    }

    if (inv.type === "common_boundary") {
      const key = inv.rule.boundary;
      const exists = boundaryCounts[key] > 0;

      results.push({
        invariant: inv,
        status: exists ? "pass" : "fail",
        violations: exists ? [] : [{ boundary: key }]
      });
    }

    if (inv.type === "rare_boundary") {
      const key = inv.rule.boundary;
      const count = boundaryCounts[key] || 0;

      // Rare boundaries should be discouraged; if they appear too often, it's a violation
      const violations = [];
      if (count > 3) {
        violations.push({ boundary: key, count });
      }

      results.push({
        invariant: inv,
        status: violations.length === 0 ? "pass" : "fail",
        violations
      });
    }
  }

  return results;
}

/**
 * Pretty-print invariant validation results.
 */
export function printInvariantValidationReport(invariants) {
  const results = validateRoutingInvariants(invariants);

  console.log("\n=== ROUTING INVARIANT VALIDATION REPORT ===\n");

  for (const r of results) {
    const { invariant, status, violations } = r;

    console.log(`Invariant: ${invariant.description}`);
    console.log(`Status: ${status}`);

    if (violations.length > 0) {
      console.log("Violations:");
      for (const v of violations) {
        if (v.node) {
          console.log(` - Node ${v.node} (out-degree ${v.outDegree})`);
        } else if (v.boundary) {
          console.log(` - Boundary ${v.boundary} (count ${v.count || 0})`);
        }
      }
    }

    console.log("");
  }

  console.log("=== END ===\n");
}
