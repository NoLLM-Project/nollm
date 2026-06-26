// system/engine/path_builder.js

import { loadRoutingRegistry } from "../3_Registry/Routing/loader.js";

export function buildPath({ metadata, structural }) {
  const { transitions } = loadRoutingRegistry();

  const graph = buildGraph(transitions);

  const { startNode, endNode } = deriveEndpoints(metadata, structural);

  if (!startNode || !endNode) {
    return { ok: false, reason: "Missing start or end node" };
  }

  const path = findPath(graph, startNode, endNode);

  if (!path || path.length === 0) {
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

  return {
    ok: true,
    path: coordPath,
    start: coordStart,
    end: coordEnd
  };
}
