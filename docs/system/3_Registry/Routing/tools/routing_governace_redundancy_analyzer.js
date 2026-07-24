// 3_Registry/Routing/tools/routing_governance_redundancy_analyzer.js

import { loadRoutingRegistry } from "../loader.js";
import { computeGovernanceCoverageMap } from "./routing_governance_coverage_map.js";

/**
 * Detect overlapping invariants:
 * - multiple invariants governing the same node or boundary
 * - invariants with identical rule scopes
 */
function detectOverlaps(nodeCoverage, boundaryCoverage) {
  const overlaps = {
    nodeOverlaps: [],
    boundaryOverlaps: [],
    invariantDuplicates: []
  };

  // Node-level overlaps
  for (const [node, invs] of Object.entries(nodeCoverage)) {
    if (invs.length > 1) {
      overlaps.nodeOverlaps.push({
        node,
        invariants: invs
      });
    }
  }

  // Boundary-level overlaps
  for (const [edge, invs] of Object.entries(boundaryCoverage)) {
    if (invs.length > 1) {
      overlaps.boundaryOverlaps.push({
        edge,
        invariants: invs
      });
    }
  }

  // Invariant duplicates (same type + same rule)
  const seen = new Map();
  for (const [node, invs] of Object.entries(nodeCoverage)) {
    for (const inv of invs) {
      const key = JSON.stringify(inv.rule);
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(inv);
    }
  }

  for (const [key, invs] of seen.entries()) {
    if (invs.length > 1) {
      overlaps.invariantDuplicates.push({
        rule: JSON.parse(key),
        invariants: invs
      });
    }
  }

  return overlaps;
}

/**
 * Detect contradictions:
 * - invariants that impose incompatible rules on the same node/boundary
 */
function detectContradictions(nodeCoverage, boundaryCoverage) {
  const contradictions = [];

  // Node contradictions: conflicting degree ranges
  for (const [node, invs] of Object.entries(nodeCoverage)) {
    const degreeRules = invs.filter(i => i.type === "degree_range_by_category");
    if (degreeRules.length > 1) {
      const ranges = degreeRules.map(r => r.rule);
      const minMax = ranges.reduce(
        (acc, r) => ({
          min: Math.max(acc.min, r.minOutDegree),
          max: Math.min(acc.max, r.maxOutDegree)
        }),
        { min: -Infinity, max: Infinity }
      );

      if (minMax.min > minMax.max) {
        contradictions.push({
          node,
          type: "degree_range_conflict",
          rules: degreeRules
        });
      }
    }
  }

  // Boundary contradictions: allowed vs discouraged vs forbidden
  for (const [edge, invs] of Object.entries(boundaryCoverage)) {
    const statuses = new Set(invs.map(i => i.rule.status));
    if (statuses.has("allowed") && statuses.has("discouraged")) {
      contradictions.push({
        edge,
        type: "boundary_conflict",
        rules: invs
      });
    }
  }

  return contradictions;
}

/**
 * Detect governance gaps:
 * - nodes or boundaries with no invariants
 */
function detectGaps(ungovernedNodes, ungovernedBoundaries) {
  return {
    ungovernedNodes,
    ungovernedBoundaries
  };
}

/**
 * Main API: analyze redundancy, overlap, contradictions, and gaps
 */
export function analyzeGovernanceRedundancy(invariants) {
  const {
    nodeCoverage,
    boundaryCoverage,
    ungovernedNodes,
    ungovernedBoundaries
  } = computeGovernanceCoverageMap(invariants);

  const overlaps = detectOverlaps(nodeCoverage, boundaryCoverage);
  const contradictions = detectContradictions(nodeCoverage, boundaryCoverage);
  const gaps = detectGaps(ungovernedNodes, ungovernedBoundaries);

  return {
    overlaps,
    contradictions,
    gaps
  };
}

/**
 * Pretty-print governance redundancy report
 */
export function printGovernanceRedundancyReport(invariants) {
  const { overlaps, contradictions, gaps } =
    analyzeGovernanceRedundancy(invariants);

  console.log("\n=== GOVERNANCE REDUNDANCY ANALYZER ===\n");

  // Overlaps
  console.log("Overlapping governance:");
  if (
    overlaps.nodeOverlaps.length === 0 &&
    overlaps.boundaryOverlaps.length === 0 &&
    overlaps.invariantDuplicates.length === 0
  ) {
    console.log(" - No overlaps detected.\n");
  } else {
    overlaps.nodeOverlaps.forEach(o =>
      console.log(` - Node ${o.node} governed by ${o.invariants.length} invariants`)
    );
    overlaps.boundaryOverlaps.forEach(o =>
      console.log(` - Boundary ${o.edge} governed by ${o.invariants.length} invariants`)
    );
    overlaps.invariantDuplicates.forEach(o =>
      console.log(` - Duplicate invariant rules: ${JSON.stringify(o.rule)}`)
    );
    console.log("");
  }

  // Contradictions
  console.log("Contradictions:");
  if (contradictions.length === 0) {
    console.log(" - No contradictions detected.\n");
  } else {
    contradictions.forEach(c => {
      if (c.node) {
        console.log(` - Node ${c.node}: conflicting degree rules`);
      } else if (c.edge) {
        console.log(` - Boundary ${c.edge}: conflicting boundary rules`);
      }
    });
    console.log("");
  }

  // Gaps
  console.log("Governance gaps:");
  if (gaps.ungovernedNodes.length === 0) {
    console.log(" - All nodes governed.");
  } else {
    console.log("Ungoverned nodes:");
    gaps.ungovernedNodes.forEach(n => console.log(` - ${n}`));
  }

  if (gaps.ungovernedBoundaries.length === 0) {
    console.log(" - All boundaries governed.\n");
  } else {
    console.log("Ungoverned boundaries:");
    gaps.ungovernedBoundaries.forEach(b => console.log(` - ${b}`));
    console.log("");
  }

  console.log("=== END ===\n");
}
