// system/engine/path_builder.js

import { loadRoutingRegistry } from "../3_Registry/Routing/loader.js";

export function buildPath({ metadata, structural }) {

  console.log("[ROUTE] buildPath() called");
  console.log("[ROUTE] metadata keys:", Object.keys(metadata || {}));
  console.log("[ROUTE] structural keys:", Object.keys(structural || {}));

  const { transitions } = loadRoutingRegistry();

  console.log("[ROUTE] transitions loaded:", transitions);

  const graph = buildGraph(transitions);

  console.log("[ROUTE] graph nodes:", Object.keys(graph || {}));

  const { startNode, endNode } = deriveEndpoints(metadata, structural);

  console.log("[ROUTE] derived endpoints:", { startNode, endNode });

  if (!startNode || !endNode) {
    console.log("[ROUTE] ERROR: Missing start or end node");
    return { ok: false, reason: "Missing start or end node" };
  }

  const path = findPath(graph, startNode, endNode);

  console.log("[ROUTE] raw path result:", path);

  if (!path || path.length === 0) {
    console.log("[ROUTE] ERROR: No valid path found");
    return {
      ok: false,
      reason: "No valid path found",
      details: { startNode, endNode }
    };
  }

  // ⭐ Convert routing nodes → coord_* IDs
  const coordPath = path.map(n => `coord_${n}`);
  const coordStart = `coord_${startNode}`;
  const coordEnd = `coord_${endNode}`;

  console.log("[ROUTE] coordPath:", coordPath);
  console.log("[ROUTE] coordStart:", coordStart);
  console.log("[ROUTE] coordEnd:", coordEnd);

  return {
    ok: true,
    path: coordPath,
    start: coordStart,
    end: coordEnd
  };
}
