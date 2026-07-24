// 3_Registry/Routing/tools/routing_category_heatmap.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Expected routing categories.
 * These match your routing taxonomy exactly.
 */
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

/**
 * Generate a category coverage map:
 * - count of transitions per category
 * - percentage coverage
 * - ASCII heatmap
 */
export function generateCategoryCoverageHeatmap() {
  const { transitions } = loadRoutingRegistry();

  // Count transitions by profile
  const counts = {};
  for (const category of EXPECTED_CATEGORIES) {
    counts[category] = 0;
  }

  for (const t of transitions) {
    if (counts[t.profile] !== undefined) {
      counts[t.profile]++;
    }
  }

  const total = transitions.length;

  // Build heatmap data
  const heatmap = {};
  for (const category of EXPECTED_CATEGORIES) {
    const count = counts[category];
    const pct = total > 0 ? (count / total) * 100 : 0;

    heatmap[category] = {
      count,
      percentage: pct,
      bar: generateBar(pct)
    };
  }

  return heatmap;
}

/**
 * Generate an ASCII bar for the heatmap.
 */
function generateBar(percentage) {
  const blocks = Math.round(percentage / 5); // 20 blocks max
  return "█".repeat(blocks) + "░".repeat(20 - blocks);
}

/**
 * Pretty-print the heatmap.
 */
export function printCategoryCoverageHeatmap() {
  const heatmap = generateCategoryCoverageHeatmap();

  console.log("\n=== ROUTING CATEGORY COVERAGE HEATMAP ===\n");

  for (const [category, data] of Object.entries(heatmap)) {
    const pct = data.percentage.toFixed(1).padStart(5, " ");
    console.log(
      `${category.padEnd(15)} | ${pct}% | ${data.bar} | ${data.count} transitions`
    );
  }

  console.log("\n=== END OF HEATMAP ===\n");
}
