// 3_Registry/Routing/tools/routing_naming_linter.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Naming rules for routing:
 * - snake_case only
 * - lowercase only
 * - no spaces
 * - no uppercase letters
 * - no trailing underscores
 * - no double underscores
 * - must start with category prefix
 */
const CATEGORY_PREFIXES = {
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

export function lintRoutingNames() {
  const { transitions } = loadRoutingRegistry();

  const issues = [];

  for (const t of transitions) {
    // Check transition ID
    issues.push(...lintName(t.id, "transition_id", t.id));

    // Check source
    issues.push(...lintName(t.source, "source", t.id));
    issues.push(...lintCategoryPrefix(t.source, "source", t.id));

    // Check target
    if (t.target) {
      issues.push(...lintName(t.target, "target", t.id));
      issues.push(...lintCategoryPrefix(t.target, "target", t.id));
    }

    // Check profile
    issues.push(...lintProfile(t.profile, t.id));
  }

  return issues;
}

/**
 * Lint a single name for formatting issues.
 */
function lintName(name, field, transitionId) {
  const problems = [];

  if (/[A-Z]/.test(name)) {
    problems.push({
      transitionId,
      field,
      name,
      issue: "Contains uppercase letters (should be lowercase snake_case)."
    });
  }

  if (/\s/.test(name)) {
    problems.push({
      transitionId,
      field,
      name,
      issue: "Contains spaces (should be snake_case)."
    });
  }

  if (/__/.test(name)) {
    problems.push({
      transitionId,
      field,
      name,
      issue: "Contains double underscores (likely typo)."
    });
  }

  if (name.endsWith("_")) {
    problems.push({
      transitionId,
      field,
      name,
      issue: "Ends with an underscore (likely typo)."
    });
  }

  if (!/^[a-z0-9_]+$/.test(name)) {
    problems.push({
      transitionId,
      field,
      name,
      issue: "Contains invalid characters (only lowercase letters, numbers, and underscores allowed)."
    });
  }

  return problems;
}

/**
 * Ensure the name starts with a valid category prefix.
 */
function lintCategoryPrefix(name, field, transitionId) {
  const problems = [];

  const matches = Object.values(CATEGORY_PREFIXES).some(regex => regex.test(name));

  if (!matches) {
    problems.push({
      transitionId,
      field,
      name,
      issue: "Does not start with a valid category prefix."
    });
  }

  return problems;
}

/**
 * Validate profile names.
 */
function lintProfile(profile, transitionId) {
  const problems = [];

  if (!CATEGORY_PREFIXES[profile]) {
    problems.push({
      transitionId,
      field: "profile",
      name: profile,
      issue: "Invalid profile name (must match a routing category)."
    });
  }

  return problems;
}

/**
 * Pretty-print the naming lint report.
 */
export function printNamingLintReport() {
  const issues = lintRoutingNames();

  console.log("\n=== ROUTING NAMING LINT REPORT ===");

  if (issues.length === 0) {
    console.log("No naming issues detected.");
    console.log("=== END ===\n");
    return;
  }

  for (const issue of issues) {
    console.log(`\nTransition: ${issue.transitionId}`);
    console.log(`Field: ${issue.field}`);
    console.log(`Name: ${issue.name}`);
    console.log(`Issue: ${issue.issue}`);
  }

  console.log("\n=== END OF REPORT ===\n");
}
