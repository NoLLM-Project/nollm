// 3_Registry/Routing/tools/routing_semantic_linter.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Semantic rules for routing transitions.
 * These rules enforce meaning, not syntax.
 */
const SEMANTIC_RULES = {
  // World-plane rules
  world: {
    forbiddenTargets: ["room_", "floor_", "ui_", "scene_"],
    allowedProfiles: ["world"],
    description: "World-plane transitions must not jump directly into lower planes."
  },

  // Hotel-plane rules
  hotel: {
    forbiddenTargets: ["room_"],
    allowedProfiles: ["hotel"],
    description: "Hotel-plane transitions must not jump directly into rooms."
  },

  // Floor-plane rules
  floors: {
    forbiddenTargets: ["world_"],
    allowedProfiles: ["floors"],
    description: "Floor-plane transitions must not jump back to world-plane."
  },

  // Circulation-plane rules
  circulation: {
    forbiddenTargets: ["world_"],
    allowedProfiles: ["circulation"],
    description: "Circulation-plane transitions must not jump to world-plane."
  },

  // Room-plane rules
  rooms: {
    forbiddenTargets: ["world_", "hotel_"],
    allowedProfiles: ["rooms"],
    description: "Room-plane transitions must not jump to world or hotel."
  },

  // UI-plane rules
  ui: {
    forbiddenTargets: ["world_", "hotel_", "floor_", "room_"],
    allowedProfiles: ["ui"],
    description: "UI-plane transitions must not target physical nodes."
  },

  // Service-plane rules
  service: {
    forbiddenTargets: ["world_", "hotel_", "floor_", "room_", "ui_"],
    allowedProfiles: ["service"],
    description: "Service-plane transitions must not target physical or UI nodes."
  },

  // Scene-plane rules
  scenes: {
    forbiddenTargets: ["world_", "hotel_", "floor_", "room_"],
    allowedProfiles: ["scenes"],
    description: "Scene-plane transitions must not target physical nodes."
  },

  // Error-plane rules
  errors: {
    forbiddenTargets: [],
    allowedProfiles: ["errors"],
    description: "Error-plane transitions are terminal or redirect to UI only."
  },

  // State-machine rules
  state_machine: {
    forbiddenTargets: ["world_"],
    allowedProfiles: ["state_machine"],
    description: "State-machine transitions must not jump to world-plane."
  }
};

/**
 * Determine category from node name.
 */
function getCategory(node) {
  if (!node) return null;

  const patterns = {
    world: /^world_/,
    hotel: /^hotel_/,
    floors: /^floor_/,
    circulation: /^hallway_|^elevator_|^stairs_/,
    rooms: /^room_/,
    ui: /^ui_/,
    scenes: /^scene_/,
    service: /^service_/,
    errors: /^error_/,
    state_machine: /^sm_/
  };

  for (const [category, regex] of Object.entries(patterns)) {
    if (regex.test(node)) return category;
  }

  return null;
}

/**
 * Lint transitions for semantic correctness.
 */
export function lintRoutingSemantics() {
  const { transitions } = loadRoutingRegistry();
  const issues = [];

  for (const t of transitions) {
    const sourceCategory = getCategory(t.source);
    const targetCategory = getCategory(t.target);
    const rules = SEMANTIC_RULES[sourceCategory];

    if (!rules) {
      issues.push({
        transitionId: t.id,
        issue: `Unknown source category for node "${t.source}".`
      });
      continue;
    }

    // 1. Profile mismatch
    if (!rules.allowedProfiles.includes(t.profile)) {
      issues.push({
        transitionId: t.id,
        issue: `Profile "${t.profile}" is not allowed for category "${sourceCategory}".`
      });
    }

    // 2. Forbidden target category
    if (t.target) {
      for (const prefix of rules.forbiddenTargets) {
        if (t.target.startsWith(prefix)) {
          issues.push({
            transitionId: t.id,
            issue: `Transition from "${sourceCategory}" cannot target "${targetCategory}".`
          });
        }
      }
    }

    // 3. Missing target category
    if (t.target && !targetCategory) {
      issues.push({
        transitionId: t.id,
        issue: `Target "${t.target}" does not match any known category.`
      });
    }

    // 4. Semantic drift: UI → world, service → UI, etc.
    if (sourceCategory === "ui" && targetCategory && targetCategory !== "ui") {
      issues.push({
        transitionId: t.id,
        issue: `UI-plane transitions must not target non-UI nodes.`
      });
    }

    if (sourceCategory === "service" && targetCategory && targetCategory !== "errors") {
      issues.push({
        transitionId: t.id,
        issue: `Service-plane transitions must only target error-plane or be terminal.`
      });
    }
  }

  return issues;
}

/**
 * Pretty-print semantic lint report.
 */
export function printSemanticLintReport() {
  const issues = lintRoutingSemantics();

  console.log("\n=== ROUTING SEMANTIC LINT REPORT ===");

  if (issues.length === 0) {
    console.log("No semantic issues detected.");
    console.log("=== END ===\n");
    return;
  }

  for (const issue of issues) {
    console.log(`\nTransition: ${issue.transitionId}`);
    console.log(`Issue: ${issue.issue}`);
  }

  console.log("\n=== END OF REPORT ===\n");
}
