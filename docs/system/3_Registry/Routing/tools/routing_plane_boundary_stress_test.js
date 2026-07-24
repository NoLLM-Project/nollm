// 3_Registry/Routing/tools/routing_plane_boundary_stress_test.js

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
 * Compute cross-plane traffic counts.
 */
export function computePlaneBoundaryStress() {
  const { transitions } = loadRoutingRegistry();

  const boundaryCounts = {}; // key: "srcCat→dstCat" -> count
  let totalCrossPlane = 0;

  for (const t of transitions) {
    if (!t.target) continue;

    const srcCat = category(t.source);
    const dstCat = category(t.target);

    if (srcCat === dstCat) continue; // same-plane, not a boundary

    const key = `${srcCat}→${dstCat}`;
    boundaryCounts[key] = (boundaryCounts[key] || 0) + 1;
    totalCrossPlane++;
  }

  return { boundaryCounts, totalCrossPlane };
}

/**
 * Pretty-print plane-boundary stress report.
 */
export function printPlaneBoundaryStressReport() {
  const { boundaryCounts, totalCrossPlane } = computePlaneBoundaryStress();

  console.log("\n=== PLANE-BOUNDARY STRESS TEST ===\n");
  console.log(`Total cross-plane transitions: ${totalCrossPlane}\n`);

  if (totalCrossPlane === 0) {
    console.log("No cross-plane transitions detected.");
    console.log("\n=== END ===\n");
    return;
  }

  const entries = Object.entries(boundaryCounts).sort(
    (a, b) => b[1] - a[1]
  );

  for (const [boundary, count] of entries) {
    const pct = ((count / totalCrossPlane) * 100).toFixed(1);
    console.log(`${boundary.padEnd(25)} : ${String(count).padStart(4)} (${pct}%)`);
  }

  console.log("\nHigh-percentage boundaries are your stressed plane interfaces.");
  console.log("Very low-percentage boundaries may be underused or missing.");
  console.log("\n=== END ===\n");
}
