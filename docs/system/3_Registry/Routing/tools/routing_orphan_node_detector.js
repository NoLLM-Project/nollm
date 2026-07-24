// 3_Registry/Routing/tools/routing_orphan_node_detector.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Detect orphan nodes:
 * - nodes that appear as a source or target
 * - but have no incoming AND no outgoing transitions
 */
export function detectOrphanNodes() {
  const { transitions } = loadRoutingRegistry();

  const sources = new Set(transitions.map(t => t.source));
  const targets = new Set(transitions.map(t => t.target).filter(Boolean));

  // All nodes that appear anywhere
  const allNodes = new Set([...sources, ...targets]);

  const orphanNodes = [];

  for (const node of allNodes) {
    const incoming = transitions.filter(t => t.target === node);
    const outgoing = transitions.filter(t => t.source === node);

    if (incoming.length === 0 && outgoing.length === 0) {
      orphanNodes.push({
        node,
        incomingCount: 0,
        outgoingCount: 0,
        possibleCauses: guessOrphanCauses(node)
      });
    }
  }

  return orphanNodes;
}

/**
 * Guess possible causes for an orphan node.
 */
function guessOrphanCauses(node) {
  const causes = [];

  // 1. Typo detection
  if (node.includes("__") || node.endsWith("_") || node.startsWith("_")) {
    causes.push("Possible typo in node name.");
  }

  // 2. Category guess
  const category = guessCategory(node);
  if (category) {
    causes.push(
      `Node name suggests it belongs to category "${category}", but no transitions reference it.`
    );
  }

  // 3. Missing transitions
  causes.push("Node may be missing its outgoing transitions.");

  // 4. Missing incoming transitions
  causes.push("Node may be missing its incoming transitions.");

  // 5. Deleted transitions
  causes.push("Transitions referencing this node may have been deleted.");

  // 6. Incomplete routing split
  causes.push("Node may not have been migrated during the routing split.");

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
 * Pretty-print orphan node report.
 */
export function printOrphanNodeReport() {
  const orphans = detectOrphanNodes();

  console.log("\n=== ORPHAN NODE REPORT ===");

  if (orphans.length === 0) {
    console.log("No orphan nodes detected.");
    console.log("=== END ===\n");
    return;
  }

  for (const o of orphans) {
    console.log(`\nNode: ${o.node}`);
    console.log("Incoming transitions: 0");
    console.log("Outgoing transitions: 0");
    console.log("Possible causes:");
    o.possibleCauses.forEach(c => console.log(" -", c));
  }

  console.log("\n=== END OF REPORT ===\n");
}
