// 3_Registry/Routing/tools/routing_dead_end_explainer.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Explain why a node is considered a dead end.
 * A dead end is a source node with no outgoing transitions.
 */
export function explainDeadEnd(nodeId) {
  const { transitions } = loadRoutingRegistry();

  const incoming = transitions.filter(t => t.target === nodeId);
  const outgoing = transitions.filter(t => t.source === nodeId);

  const explanation = {
    node: nodeId,
    isDeadEnd: outgoing.length === 0,
    incomingCount: incoming.length,
    outgoingCount: outgoing.length,
    incomingTransitions: incoming.map(t => t.id),
    outgoingTransitions: outgoing.map(t => t.id),
    reasons: []
  };

  // -----------------------------
  // 1. No outgoing transitions
  // -----------------------------
  if (outgoing.length === 0) {
    explanation.reasons.push("No outgoing transitions defined for this node.");
  }

  // -----------------------------
  // 2. Node exists only as a target
  // -----------------------------
  if (incoming.length > 0 && outgoing.length === 0) {
    explanation.reasons.push("Node is only used as a target and never as a source.");
  }

  // -----------------------------
  // 3. Possible missing category file
  // -----------------------------
  const categoryGuess = guessCategory(nodeId);
  if (outgoing.length === 0 && categoryGuess) {
    explanation.reasons.push(
      `Node name suggests it belongs to category "${categoryGuess}", but no transitions originate from it.`
    );
  }

  // -----------------------------
  // 4. Possible typo or orphan
  // -----------------------------
  if (incoming.length === 0 && outgoing.length === 0) {
    explanation.reasons.push("Node appears to be orphaned (no incoming or outgoing transitions).");
  }

  return explanation;
}

/**
 * Guess the category of a node based on naming conventions.
 * This helps detect missing category files.
 */
function guessCategory(nodeId) {
  const patterns