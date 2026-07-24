// 3_Registry/Routing/tools/routing_invariant_drift_detector.js

import { loadRoutingRegistry } from "../loader.js";
import { validateRoutingInvariants } from "./routing_invariant_validator.js";

/**
 * Drift detector state:
 * Stores the last-known validation results.
 * 
 * This is NOT persisted to disk — the caller decides how to store history.
 * This module only compares "previous" vs "current".
 */
let previousValidation = null;

/**
 * Detect drift:
 * - invariants that used to pass but now fail
 * - invariants that used to fail but now pass (unexpected convergence)
 * - new violations
 * - resolved violations
 */
export function detectInvariantDrift(invariants) {
  const current = validateRoutingInvariants(invariants);

  if (!previousValidation) {
    // First run: no drift possible
    previousValidation = current;
    return {
      driftDetected: false,
      newFailures: [],
      resolvedFailures: [],
      statusChanges: []
    };
  }

  const drift = {
    driftDetected: false,
    newFailures: [],
    resolvedFailures: [],
    statusChanges: []
  };

  for (let i = 0; i < invariants.length; i++) {
    const prev = previousValidation[i];
    const curr = current[i];

    // Status changed?
    if (prev.status !== curr.status) {
      drift.statusChanges.push({
        invariant: invariants[i],
        previousStatus: prev.status,
        currentStatus: curr.status
      });

      drift.driftDetected = true;
    }

    // New failures
    if (prev.status === "pass" && curr.status === "fail") {
      drift.newFailures.push({
        invariant: invariants[i],
        violations: curr.violations
      });
      drift.driftDetected = true;
    }

    // Resolved failures
    if (prev.status === "fail" && curr.status === "pass") {
      drift.resolvedFailures.push({
        invariant: invariants[i]
      });
      drift.driftDetected = true;
    }
  }

  // Update stored state
  previousValidation = current;

  return drift;
}

/**
 * Pretty-print drift report.
 */
export function printInvariantDriftReport(invariants) {
  const drift = detectInvariantDrift(invariants);

  console.log("\n=== INVARIANT DRIFT REPORT ===\n");

  if (!drift.driftDetected) {
    console.log("No drift detected. All invariants stable.\n");
    return;
  }

  if (drift.newFailures.length > 0) {
    console.log("New invariant failures:");
    for (const f of drift.newFailures) {
      console.log(` - ${f.invariant.description}`);
      for (const v of f.violations) {
        if (v.node) {
          console.log(`    Node ${v.node} (out-degree ${v.outDegree})`);
        } else if (v.boundary) {
          console.log(`    Boundary ${v.boundary} (count ${v.count || 0})`);
        }
      }
    }
    console.log("");
  }

  if (drift.resolvedFailures.length > 0) {
    console.log("Resolved invariant failures:");
    for (const r of drift.resolvedFailures) {
      console.log(` - ${r.invariant.description}`);
    }
    console.log("");
  }

  if (drift.statusChanges.length > 0) {
    console.log("Status changes:");
    for (const s of drift.statusChanges) {
      console.log(
        ` - ${s.invariant.description}: ${s.previousStatus} → ${s.currentStatus}`
      );
    }
    console.log("");
  }

  console.log("=== END ===\n");
}
