// 3_Registry/Routing/tools/routing_missing_target_detector.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Detect transitions whose target does not exist as a source node.
 * Returns a list of objects:
 * {
 *   id: transitionId,
 *   source: sourceNode,
 *   target: missingTarget,
 *   possibleCauses: [...]
 * }
 */
export function detectMissingTargets() {
  const { transitions } = loadRoutingRegistry();

  const sources = new Set(transitions.map(t => t.source));
  const targets = transitions.map(t => t.target).filter(Boolean);

  const missing = [];

  for (const t of transitions) {
    if (!t.target) continue; // null targets are allowed (terminal)
    if (!sources.has(t.target)) {
      missing.push({
        id: t.id,
        source: t.source,
        target: t.target,
        possibleCauses: guessCauses(t.target)
      });
    }
  }

  return missing;
}

/**
 * Guess possible causes for a missing target.
 */
function guessCauses(target) {
  const causes = [];

  // 1. Typo detection (simple heuristic)
  if (target.includes("__") || target.endsWith("_") || target.startsWith("_")) {
    causes.push("Possible typo in target name.");
  }

  // 2. Category guess
  const category = guessCategory(target);
  if (category) {
    causes.push(
      `Target name suggests it belongs to category "${category}", but no transitions originate from it.`
    );
  }

  // 3. Missing category file
  if (category) {
    causes.push(`Category "${category}" may be missing a routing file.`);
  }

  // 4. Deleted node
  causes.push("Target node may have been deleted without updating transitions.");

  // 5. Incomplete routing split
  causes.push("Target node may not have been migrated during the routing split.");

  return causes;
}

/**
 * Guess the category of a node based on naming conventions.
 */
function guessCategory(nodeId) {
  const patterns = {
    world: /^world_/,
    hotel: /^hotel_/,
    floors: /^floor_/,
    rooms: /^room_/,
    ui: /^ui_/,
    scenes: /^scene_/,
    service: /^service_/,
    errors: /^error_/,
    state_machine: /^sm_/
  };

  for (const [category, regex] of Object.entries(patterns)) {
    if (regex.test(nodeId)) return category;
  }

  return null;
}

/**
 * Pretty-print missing target report.
 */
export function printMissingTargetReport() {
  const missing = detectMissingTargets();

  console.log("\n=== MISSING TARGET REPORT ===");

  if (missing.length === 0) {
    console.log("No missing targets detected.");
    console.log("=== END ===\n");
    return;
  }

  for (const m of missing) {
    console.log(`\nTransition: ${m.id}`);
    console.log(`Source: ${m.source}`);
    console.log(`Missing target: ${m.target}`);
    console.log("Possible causes:");
    m.possibleCauses.forEach(c => console.log(" -", c));
  }

  console.log("\n=== END OF REPORT ===\n");
}
