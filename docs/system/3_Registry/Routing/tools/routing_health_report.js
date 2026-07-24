// 3_Registry/Routing/tools/routing_health_report.js

import { loadRoutingRegistry } from "../loader.js";
import { validateRoutingEntry } from "../routing_validator.js";
import { checkRoutingInvariants } from "../routing_invariants.js";
import routingSchema from "../routing.schema.json";

/**
 * Generate a full routing health report:
 * - summary counts
 * - schema issues
 * - invariant issues
 * - unreachable nodes
 * - dead ends
 * - category completeness
 * - cycle detection (lightweight)
 */
export function generateRoutingHealthReport() {
  const { transitions } = loadRoutingRegistry();

  const report = {
    summary: {},
    warnings: [],
    anomalies: [],
    unreachable: [],
    deadEnds: [],
    cycles: [],
    categoryCompleteness: {}
  };

  // -----------------------------
  // 1. Summary
  // -----------------------------
  report.summary.totalTransitions = transitions.length;

  const bySource = {};
  const byProfile = {};

  for (const t of transitions) {
    if (!bySource[t.source]) bySource[t.source] = [];
    bySource[t.source].push(t);

    if (!byProfile[t.profile]) byProfile[t.profile] = [];
    byProfile[t.profile].push(t);
  }

  report.summary.sources = Object.keys(bySource).length;
  report.summary.profiles = Object.keys(byProfile).length;

  // -----------------------------
  // 2. Schema validation
  // -----------------------------
  for (const t of transitions) {
    try {
      validateRoutingEntry(t, routingSchema);
    } catch (err) {
      report.anomalies.push({
        id: t.id,
        type: "schema_error",
        message: err.message
      });
    }
  }

  // -----------------------------
  // 3. Invariant checks
  // -----------------------------
  try {
    checkRoutingInvariants(transitions);
  } catch (err) {
    report.anomalies.push({
      type: "invariant_violation",
      message: err.message
    });
  }

  // -----------------------------
  // 4. Unreachable nodes
  // -----------------------------
  const sources = new Set(transitions.map(t => t.source));
  const targets = new Set(transitions.map(t => t.target).filter(Boolean));

  for (const target of targets) {
    if (!sources.has(target)) {
      report.unreachable.push(target);
    }
  }

  // -----------------------------
  // 5. Dead ends (nodes with no outgoing transitions)
  // -----------------------------
  for (const source of sources) {
    if (!bySource[source] || bySource[source].length === 0) {
      report.deadEnds.push(source);
    }
  }

  // -----------------------------
  // 6. Category completeness
  // -----------------------------
  const expectedCategories = [
    "world",
    "hotel",
    "floors",
    "circulation",
    "rooms",
    "non_navigable",
    "service",
    "ui",
    "scenes",
    "state_machine",
    "errors"
  ];

  for (const category of expectedCategories) {
    const count = transitions.filter(t => t.profile === category).length;
    report.categoryCompleteness[category] = count;
  }

  // -----------------------------
  // 7. Cycle detection (lightweight)
  // -----------------------------
  const visited = new Set();
  const stack = new Set();

  function dfs(node) {
    if (stack.has(node)) {
      report.cycles.push(node);
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);

    const outgoing = bySource[node] || [];
    for (const t of outgoing) {
      if (t.target) dfs(t.target);
    }

    stack.delete(node);
  }

  for (const source of sources) {
    dfs(source);
  }

  return report;
}

/**
 * Pretty-print the health report to console.
 */
export function printRoutingHealthReport() {
  const report = generateRoutingHealthReport();

  console.log("=== ROUTING HEALTH REPORT ===\n");

  console.log("Summary:");
  console.log(report.summary);

  if (report.anomalies.length > 0) {
    console.log("\nAnomalies:");
    report.anomalies.forEach(a => console.log(" -", a));
  } else {
    console.log("\nNo anomalies detected.");
  }

  if (report.unreachable.length > 0) {
    console.log("\nUnreachable nodes:");
    report.unreachable.forEach(u => console.log(" -", u));
  }

  if (report.deadEnds.length > 0) {
    console.log("\nDead-end nodes:");
    report.deadEnds.forEach(d => console.log(" -", d));
  }

  if (report.cycles.length > 0) {
    console.log("\nCycles detected:");
    report.cycles.forEach(c => console.log(" -", c));
  }

  console.log("\nCategory completeness:");
  console.log(report.categoryCompleteness);

  console.log("\n=== END OF REPORT ===");
}
