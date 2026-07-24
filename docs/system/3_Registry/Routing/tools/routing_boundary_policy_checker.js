// 3_Registry/Routing/tools/routing_boundary_policy_checker.js

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

/**
 * Boundary policy matrix.
 * 
 * allowed: transition is permitted
 * forbidden: transition must not exist
 * discouraged: allowed but flagged
 * required: must exist at least once
 */
const POLICY = {
  world: {
    world: "allowed",
    hotel: "allowed",
    floors: "forbidden",
    rooms: "forbidden",
    ui: "discouraged",
    scenes: "discouraged",
    service: "forbidden",
    errors: "allowed",
    state_machine: "discouraged"
  },

  hotel: {
    world: "allowed",
    hotel: "allowed",
    floors: "allowed",
    rooms: "forbidden",
    ui: "discouraged",
    scenes: "discouraged",
    service: "forbidden",
    errors: "allowed",
    state_machine: "discouraged"
  },

  floors: {
    world: "forbidden",
    hotel: "allowed",
    floors: "allowed",
    rooms: "allowed",
    ui: "discouraged",
    scenes: "discouraged",
    service: "forbidden",
    errors: "allowed",
    state_machine: "discouraged"
  },

  rooms: {
    world: "forbidden",
    hotel: "forbidden",
    floors: "allowed",
    rooms: "allowed",
    ui: "allowed",
    scenes: "discouraged",
    service: "forbidden",
    errors: "allowed",
    state_machine: "discouraged"
  },

  ui: {
    world: "forbidden",
    hotel: "forbidden",
    floors: "forbidden",
    rooms: "forbidden",
    ui: "allowed",
    scenes: "allowed",
    service: "allowed",
    errors: "allowed",
    state_machine: "allowed"
  },

  scenes: {
    world: "forbidden",
    hotel: "forbidden",
    floors: "forbidden",
    rooms: "forbidden",
    ui: "allowed",
    scenes: "allowed",
    service: "allowed",
    errors: "allowed",
    state_machine: "allowed"
  },

  service: {
    world: "forbidden",
    hotel: "forbidden",
    floors: "forbidden",
    rooms: "forbidden",
    ui: "allowed",
    scenes: "allowed",
    service: "allowed",
    errors: "allowed",
    state_machine: "allowed"
  },

  errors: {
    world: "forbidden",
    hotel: "forbidden",
    floors: "forbidden",
    rooms: "forbidden",
    ui: "allowed",
    scenes: "allowed",
    service: "allowed",
    errors: "allowed",
    state_machine: "allowed"
  },

  state_machine: {
    world: "forbidden",
    hotel: "discouraged",
    floors: "discouraged",
    rooms: "discouraged",
    ui: "allowed",
    scenes: "allowed",
    service: "allowed",
    errors: "allowed",
    state_machine: "allowed"
  }
};

/**
 * Evaluate each transition against the policy matrix.
 */
export function checkBoundaryPolicy() {
  const { transitions } = loadRoutingRegistry();
  const violations = [];
  const warnings = [];
  const requiredCounts = {};

  // Track required boundaries
  for (const srcCat of Object.keys(POLICY)) {
    for (const dstCat of Object.keys(POLICY[srcCat])) {
      if (POLICY[srcCat][dstCat] === "required") {
        requiredCounts[`${srcCat}→${dstCat}`] = 0;
      }
    }
  }

  for (const t of transitions) {
    if (!t.target) continue;

    const srcCat = category(t.source);
    const dstCat = category(t.target);

    const rule = POLICY[srcCat]?.[dstCat] || "unknown";

    if (rule === "forbidden") {
      violations.push({
        transitionId: t.id,
        source: t.source,
        target: t.target,
        rule: "forbidden"
      });
    }

    if (rule === "discouraged") {
      warnings.push({
        transitionId: t.id,
        source: t.source,
        target: t.target,
        rule: "discouraged"
      });
    }

    if (rule === "required") {
      requiredCounts[`${srcCat}→${dstCat}`]++;
    }
  }

  const missingRequired = Object.entries(requiredCounts)
    .filter(([_, count]) => count === 0)
    .map(([boundary]) => boundary);

  return { violations, warnings, missingRequired };
}

/**
 * Pretty-print boundary policy report.
 */
export function printBoundaryPolicyReport() {
  const { violations, warnings, missingRequired } = checkBoundaryPolicy();

  console.log("\n=== BOUNDARY POLICY REPORT ===\n");

  if (violations.length === 0) {
    console.log("No forbidden transitions detected.\n");
  } else {
    console.log("Forbidden transitions:");
    for (const v of violations) {
      console.log(` - ${v.source} → ${v.target} (transition ${v.transitionId})`);
    }
    console.log("");
  }

  if (warnings.length > 0) {
    console.log("Discouraged transitions:");
    for (const w of warnings) {
      console.log(` - ${w.source} → ${w.target} (transition ${w.transitionId})`);
    }
    console.log("");
  }

  if (missingRequired.length > 0) {
    console.log("Missing required boundaries:");
    for (const b of missingRequired) {
      console.log(` - ${b}`);
    }
    console.log("");
  }

  console.log("=== END ===\n");
}
