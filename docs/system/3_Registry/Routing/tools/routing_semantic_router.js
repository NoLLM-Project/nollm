import { loadRoutingRegistry } from "../loader.js";

/**
 * Plane classifier
 */
function planeOf(node) {
  if (!node) return "unknown";
  if (node.startsWith("front_desk") || node.startsWith("lobby") ||
      node.startsWith("floor_") || node.startsWith("room_") ||
      node.startsWith("district_door")) return "spatial";

  if (node.startsWith("coord_ui_")) return "ui";
  if (node.startsWith("coord_")) return "service_or_logic";
  if (node.startsWith("scene_") || node === "district_scene") return "scene";

  if (node.startsWith("skeleton_")) return "skeleton";

  return "unknown";
}

/**
 * Transition → plane rules
 */
const transitionRules = {
  navigation: "spatial",
  load_scene: "scene",
  dispatch: "service_or_logic",
  render: "ui"
};

/**
 * Profile → plane rules
 */
const profileRules = {
  standard: "spatial",
  service: "scene",
  strict: "service_or_logic",
  ui: "ui"
};

/**
 * Validate routing semantics
 */
export function validateRoutingSemantics() {
  const { transitions, registry } = loadRoutingRegistry();

  const errors = [];

  // Build adjacency for dead-end / cycle checks
  const graph = {};
  for (const t of transitions) {
    if (!graph[t.source]) graph[t.source] = [];
    if (t.target) graph[t.source].push(t.target);
  }

  /**
   * 1. Validate plane/profile/transition alignment
   */
  for (const t of transitions) {
    const srcPlane = planeOf(t.source);
    const dstPlane = planeOf(t.target);
    const expectedPlane = transitionRules[t.transition];
    const expectedProfilePlane = profileRules[t.profile];

    // Transition must match plane
    if (expectedPlane !== srcPlane && expectedPlane !== dstPlane) {
      errors.push({
        type: "plane_transition_mismatch",
        entry: t,
        message: `Transition "${t.transition}" not valid for plane ${srcPlane}→${dstPlane}`
      });
    }

    // Profile must match plane
    if (expectedProfilePlane !== srcPlane && expectedProfilePlane !== dstPlane) {
      errors.push({
        type: "profile_plane_mismatch",
        entry: t,
        message: `Profile "${t.profile}" not valid for plane ${srcPlane}→${dstPlane}`
      });
    }

    // Skeleton nodes cannot appear
    if (srcPlane === "skeleton" || dstPlane === "skeleton") {
      errors.push({
        type: "skeleton_violation",
        entry: t,
        message: `Skeleton nodes cannot appear in routing`
      });
    }
  }

  /**
   * 2. Validate registry existence
   */
  for (const t of transitions) {
    if (!registry[t.source]) {
      errors.push({
        type: "missing_source",
        entry: t,
        message: `Source node "${t.source}" not found in registry`
      });
    }
    if (t.target && !registry[t.target]) {
      errors.push({
        type: "missing_target",
        entry: t,
        message: `Target node "${t.target}" not found in registry`
      });
    }
  }

  /**
   * 3. Validate no-dead-ends (spatial only)
   */
  for (const node of Object.keys(graph)) {
    const plane = planeOf(node);
    if (plane === "spatial" && graph[node].length === 0) {
      errors.push({
        type: "dead_end",
        node,
        message: `Spatial node "${node}" has no outgoing routes`
      });
    }
  }

  /**
   * 4. Validate no-cycles-without-exit (spatial)
   */
  function dfs(node, visited = new Set()) {
    if (visited.has(node)) return true; // cycle
    visited.add(node);
    for (const next of graph[node] || []) {
      if (dfs(next, new Set(visited))) return true;
    }
    return false;
  }

  for (const node of Object.keys(graph)) {
    if (planeOf(node) === "spatial") {
      if (dfs(node)) {
        // Ensure cycle has an exit
        const hasExit = (graph[node] || []).some(
          n => planeOf(n) !== "spatial"
        );
        if (!hasExit) {
          errors.push({
            type: "cycle_without_exit",
            node,
            message: `Spatial cycle at "${node}" has no exit`
          });
        }
      }
    }
  }

  /**
   * 5. Validate scene-plane rules
   */
  for (const t of transitions) {
    if (t.transition === "load_scene") {
      const srcPlane = planeOf(t.source);
      const dstPlane = planeOf(t.target);

      if (srcPlane !== "spatial" && srcPlane !== "scene") {
        errors.push({
          type: "invalid_scene_source",
          entry: t,
          message: `load_scene must originate from spatial or scene plane`
        });
      }

      if (dstPlane !== "scene" && dstPlane !== "spatial") {
        errors.push({
          type: "invalid_scene_target",
          entry: t,
          message: `load_scene must target scene or spatial plane`
        });
      }
    }
  }

  return errors;
}

/**
 * Pretty-print
 */
export function printRoutingSemanticReport() {
  const errors = validateRoutingSemantics();

  console.log("\n=== ROUTING SEMANTIC VALIDATION REPORT ===\n");

  if (errors.length === 0) {
    console.log("All routing invariants PASS.\n");
  } else {
    for (const e of errors) {
      console.log(`- [${e.type}] ${e.message}`);
      if (e.entry) console.log(`  Entry:`, e.entry);
      if (e.node) console.log(`  Node: ${e.node}`);
      console.log("");
    }
  }

  console.log("=== END ===\n");
}
