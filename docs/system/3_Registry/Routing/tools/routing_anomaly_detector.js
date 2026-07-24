// 3_Registry/Routing/tools/routing_anomaly_detector.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Basic helpers
 */
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

function buildGraph(transitions) {
  const out = {};
  const inc = {};
  for (const t of transitions) {
    if (!out[t.source]) out[t.source] = [];
    out[t.source].push(t.target || null);

    if (t.target) {
      if (!inc[t.target]) inc[t.target] = [];
      inc[t.target].push(t.source);
    }
  }
  return { out, inc };
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function std(values, m) {
  if (!values.length) return 0;
  const v =
    values.reduce((acc, x) => acc + (x - m) * (x - m), 0) / values.length;
  return Math.sqrt(v);
}

/**
 * Main anomaly detection:
 * - degree outliers (in/out)
 * - category behavior outliers
 * - cross-plane outliers
 */
export function detectRoutingAnomalies() {
  const { transitions } = loadRoutingRegistry();
  const { out, inc } = buildGraph(transitions);

  const allNodes = new Set([
    ...transitions.map(t => t.source),
    ...transitions.map(t => t.target).filter(Boolean)
  ]);

  // Degree stats
  const outDegrees = [];
  const inDegrees = [];
  const nodeStats = {};

  for (const node of allNodes) {
    const o = (out[node] || []).filter(x => x !== null).length;
    const i = (inc[node] || []).length;
    nodeStats[node] = { outDegree: o, inDegree: i, category: category(node) };
    outDegrees.push(o);
    inDegrees.push(i);
  }

  const outMean = mean(outDegrees);
  const outStd = std(outDegrees, outMean);
  const inMean = mean(inDegrees);
  const inStd = std(inDegrees, inMean);

  const degreeAnomalies = [];
  for (const [node, s] of Object.entries(nodeStats)) {
    const outZ = outStd === 0 ? 0 : (s.outDegree - outMean) / outStd;
    const inZ = inStd === 0 ? 0 : (s.inDegree - inMean) / inStd;

    if (Math.abs(outZ) >= 2 || Math.abs(inZ) >= 2) {
      degreeAnomalies.push({
        node,
        category: s.category,
        outDegree: s.outDegree,
        inDegree: s.inDegree,
        outZ,
        inZ
      });
    }
  }

  // Cross-plane anomalies: rare category pairs
  const boundaryCounts = {};
  for (const t of transitions) {
    if (!t.target) continue;
    const srcCat = category(t.source);
    const dstCat = category(t.target);
    const key = `${srcCat}→${dstCat}`;
    boundaryCounts[key] = (boundaryCounts[key] || 0) + 1;
  }

  const totalBoundaries = Object.values(boundaryCounts).reduce(
    (a, b) => a + b,
    0
  );

  const boundaryAnomalies = [];
  if (totalBoundaries > 0) {
    for (const [key, count] of Object.entries(boundaryCounts)) {
      const pct = count / totalBoundaries;
      if (pct < 0.01) {
        boundaryAnomalies.push({
          boundary: key,
          count,
          percentage: pct
        });
      }
    }
  }

  // Category behavior anomalies: nodes whose category pattern is odd
  const categoryOutliers = [];
  const catOutDegrees = {};
  for (const [node, s] of Object.entries(nodeStats)) {
    const cat = s.category;
    if (!catOutDegrees[cat]) catOutDegrees[cat] = [];
    catOutDegrees[cat].push(s.outDegree);
  }

  const catStats = {};
  for (const [cat, vals] of Object.entries(catOutDegrees)) {
    const m = mean(vals);
    const sd = std(vals, m);
    catStats[cat] = { mean: m, std: sd };
  }

  for (const [node, s] of Object.entries(nodeStats)) {
    const cs = catStats[s.category];
    if (!cs) continue;
    const z = cs.std === 0 ? 0 : (s.outDegree - cs.mean) / cs.std;
    if (Math.abs(z) >= 2) {
      categoryOutliers.push({
        node,
        category: s.category,
        outDegree: s.outDegree,
        categoryOutZ: z
      });
    }
  }

  return {
    degreeAnomalies,
    boundaryAnomalies,
    categoryOutliers
  };
}

/**
 * Pretty-print anomaly report.
 */
export function printRoutingAnomalyReport() {
  const { degreeAnomalies, boundaryAnomalies, categoryOutliers } =
    detectRoutingAnomalies();

  console.log("\n=== ROUTING ANOMALY REPORT (HEURISTIC) ===\n");

  if (degreeAnomalies.length === 0) {
    console.log("No degree anomalies detected.\n");
  } else {
    console.log("Degree anomalies (nodes with unusual in/out degree):");
    for (const a of degreeAnomalies) {
      console.log(
        ` - ${a.node} [${a.category}] | out=${a.outDegree} (z=${a.outZ.toFixed(
          2
        )}), in=${a.inDegree} (z=${a.inZ.toFixed(2)})`
      );
    }
    console.log("");
  }

  if (boundaryAnomalies.length === 0) {
    console.log("No rare plane boundaries detected.\n");
  } else {
    console.log("Rare plane boundaries (very low-frequency category pairs):");
    for (const b of boundaryAnomalies) {
      console.log(
        ` - ${b.boundary} : ${b.count} (${(b.percentage * 100).toFixed(2)}%)`
      );
    }
    console.log("");
  }

  if (categoryOutliers.length === 0) {
    console.log("No category behavior outliers detected.\n");
  } else {
    console.log("Category behavior outliers (nodes odd within their own plane):");
    for (const c of categoryOutliers) {
      console.log(
        ` - ${c.node} [${c.category}] | out=${c.outDegree} (category z=${c.categoryOutZ.toFixed(
          2
        )})`
      );
    }
    console.log("");
  }

  console.log("=== END OF REPORT ===\n");
}
