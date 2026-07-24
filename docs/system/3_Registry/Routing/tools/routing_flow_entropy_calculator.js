// 3_Registry/Routing/tools/routing_flow_entropy_calculator.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Build outgoing transition counts per node.
 */
function buildOutgoingCounts(transitions) {
  const counts = {};
  for (const t of transitions) {
    if (!t.target) continue;
    if (!counts[t.source]) counts[t.source] = {};
    counts[t.source][t.target] = (counts[t.source][t.target] || 0) + 1;
  }
  return counts;
}

/**
 * Shannon entropy for a discrete distribution.
 */
function entropyForDistribution(freqs) {
  const total = freqs.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;

  let h = 0;
  for (const f of freqs) {
    const p = f / total;
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Compute per-node flow entropy and a global summary.
 */
export function computeFlowEntropy() {
  const { transitions } = loadRoutingRegistry();
  const outgoingCounts = buildOutgoingCounts(transitions);

  const perNode = {};
  let globalWeightedEntropy = 0;
  let globalWeight = 0;

  for (const [source, targets] of Object.entries(outgoingCounts)) {
    const freqs = Object.values(targets);
    const h = entropyForDistribution(freqs);
    const total = freqs.reduce((a, b) => a + b, 0);

    perNode[source] = {
      entropy: h,
      totalTransitions: total,
      distinctTargets: freqs.length
    };

    globalWeightedEntropy += h * total;
    globalWeight += total;
  }

  const globalEntropy = globalWeight > 0 ? globalWeightedEntropy / globalWeight : 0;

  return { perNode, globalEntropy };
}

/**
 * Pretty-print flow entropy summary.
 */
export function printFlowEntropyReport() {
  const { perNode, globalEntropy } = computeFlowEntropy();

  console.log("\n=== ROUTING FLOW ENTROPY REPORT ===\n");
  console.log(`Global weighted entropy: ${globalEntropy.toFixed(3)} bits\n`);

  const entries = Object.entries(perNode).sort(
    (a, b) => b[1].entropy - a[1].entropy
  );

  for (const [node, info] of entries) {
    console.log(
      `${node.padEnd(25)} | H = ${info.entropy.toFixed(3)} bits | ` +
      `${String(info.distinctTargets).padStart(2)} targets | ` +
      `${String(info.totalTransitions).padStart(3)} transitions`
    );
  }

  console.log("\nHigh entropy → spread flow (many balanced options).");
  console.log("Low entropy  → funneled flow (one or few dominant options).");
  console.log("\n=== END OF REPORT ===\n");
}
