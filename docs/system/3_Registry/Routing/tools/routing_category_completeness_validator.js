// 3_Registry/Routing/tools/routing_category_completeness_validator.js

import { loadRoutingRegistry } from "../loader.js";

const EXPECTED_CATEGORIES = [
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

// You can tune these thresholds if you want stricter/looser completeness rules.
const MIN_TRANSITIONS_PER_CATEGORY = 1;   // must exist at least once
const LOW_DENSITY_THRESHOLD_PERCENT = 3;  // “suspiciously low” share of total

export function validateCategoryCompleteness() {
  const { transitions } = loadRoutingRegistry();

  const total = transitions.length || 1;
  const counts = {};
  const issues = [];

  for (const cat of EXPECTED_CATEGORIES) counts[cat] = 0;

  for (const t of transitions) {
    if (counts[t.profile] !== undefined) {
      counts[t.profile]++;
    }
  }

  for (const category of EXPECTED_CATEGORIES) {
    const count = counts[category];
    const pct = (count / total) * 100;

    if (count === 0) {
      issues.push({
        category,
        issue: "Category has zero transitions (missing or not yet wired)."
      });
    } else if (count < MIN_TRANSITIONS_PER_CATEGORY) {
      issues.push({
        category,
        issue: `Category has fewer than ${MIN_TRANSITIONS_PER_CATEGORY} transitions.`
      });
    } else if (pct < LOW_DENSITY_THRESHOLD_PERCENT) {
      issues.push({
        category,
        issue: `Category is under-represented (${pct.toFixed(
          1
        )}% of transitions).`
      });
    }
  }

  return { counts, total, issues };
}

export function printCategoryCompletenessReport() {
  const { counts, total, issues } = validateCategoryCompleteness();

  console.log("\n=== ROUTING CATEGORY COMPLETENESS REPORT ===\n");
  console.log(`Total transitions: ${total}\n`);

  for (const [category, count] of Object.entries(counts)) {
    const pct = ((count / total) * 100).toFixed(1);
    console.log(`${category.padEnd(15)} : ${String(count).padStart(3)} (${pct}%)`);
  }

  if (issues.length === 0) {
    console.log("\nAll expected categories are present and above minimum thresholds.");
    console.log("\n=== END OF REPORT ===\n");
    return;
  }

  console.log("\nIssues:");
  for (const issue of issues) {
    console.log(` - [${issue.category}] ${issue.issue}`);
  }

  console.log("\n=== END OF REPORT ===\n");
}
