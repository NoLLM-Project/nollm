// 3_Registry/Routing/tools/routing_governance_change_impact_analyzer.js

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
 * Simulate a change:
 * - add transition
 * - remove transition
 * - modify transition (source/target)
 */
function simulateChange(transitions, change) {
  const cloned = transitions.map(t => ({ ...t }));

  if (change.type === "add") {
    cloned.push({
      id: "simulated_add",
      source: change.source,
      target: change.target
    });
  }

  if (change.type === "remove") {
    return cloned.filter(
      t => !(t.source === change.source && t.target === change.target)
    );
  }

  if (change.type === "modify") {
    return cloned.map(t => {
      if (t.id !== change.id) return t;
      return {
        ...t,
        source: change.newSource || t.source,
        target: change.newTarget || t.target
      };
    });
  }

  return cloned;
}

/**
 * Predict which invariants will break if a change is applied.
 */
export function analyzeGovernanceChangeImpact(invariants, change) {
  const { transitions } = loadRoutingRegistry();

  // Validate invariants BEFORE change
  const before = validateRoutingInvariants(invariants);

  // Simulate change
  const afterTransitions = simulateChange(transitions, change);

  // Build a temporary loader-like object
  const fakeLoader = {
    transitions: afterTransitions
  };

  // Validate invariants AFTER change
  const after = validateRoutingInvariants.call(
    { loadRoutingRegistry: () => fakeLoader },
    invariants
  );

  const impact = [];

  for (let i = 0; i < invariants.length; i++) {
    const inv = invariants[i];
    const prev = before[i];
    const next = after[i];

    if (prev.status === "pass" && next.status === "fail") {
      impact.push({
        invariant: inv,
        type: "new_violation",
        violations: next.violations
      });
    }

    if (prev.status === "fail" && next.status === "pass") {
      impact.push({
        invariant: inv,
        type: "resolved_violation"
      });
    }

    if (prev.status !== next.status) {
      impact.push({
        invariant: inv,
        type: "status_change",
        from: prev.status,
        to: next.status
      });
    }
  }

  return impact;
}

/**
 * Pretty-print impact analysis
 */
export function printGovernanceChangeImpact(invariants, change) {
  const impact = analyzeGovernanceChangeImpact(invariants, change);

  console.log("\n=== GOVERNANCE CHANGE IMPACT ANALYSIS ===\n");
  console.log("Simulated change:");
  console.log(change);
  console.log("");

  if (impact.length === 0) {
    console.log("No invariants affected by this change.\n");
    return;
  }

  for (const item of impact) {
    console.log(`Invariant: ${item.invariant.description}`);
    console.log(`Impact type: ${item.type}`);

    if (item.type === "new_violation") {
      console.log("Violations:");
      for (const v of item.violations) {
        if (v.node) {
          console.log(` - Node ${v.node} (out-degree ${v.outDegree})`);
        } else if (v.boundary) {
          console.log(` - Boundary ${v.boundary} (count ${v.count || 0})`);
        }
      }
    }

    if (item.type === "status_change") {
      console.log(`Status: ${item.from} → ${item.to}`);
    }

    console.log("");
  }

  console.log("=== END ===\n");
}
