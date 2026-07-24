// 3_Registry/Routing/tools/routing_diff.js

import { loadRoutingRegistry } from "../loader.js";

/**
 * Compare two routing graphs and produce a diff report.
 * oldGraph: array of transitions (from a saved JSON file)
 * newGraph: array of transitions (from the current loader)
 */
export function diffRoutingGraphs(oldGraph, newGraph) {
  const oldById = Object.fromEntries(oldGraph.map(t => [t.id, t]));
  const newById = Object.fromEntries(newGraph.map(t => [t.id, t]));

  const added = [];
  const removed = [];
  const modified = [];
  const unchanged = [];

  // Check for added or modified transitions
  for (const id of Object.keys(newById)) {
    if (!oldById[id]) {
      added.push(newById[id]);
    } else {
      const oldEntry = oldById[id];
      const newEntry = newById[id];

      if (JSON.stringify(oldEntry) !== JSON.stringify(newEntry)) {
        modified.push({ id, old: oldEntry, new: newEntry });
      } else {
        unchanged.push(newEntry);
      }
    }
  }

  // Check for removed transitions
  for (const id of Object.keys(oldById)) {
    if (!newById[id]) {
      removed.push(oldById[id]);
    }
  }

  return { added, removed, modified, unchanged };
}

/**
 * Convenience function:
 * Load the current routing graph and diff it against a saved JSON file.
 */
export function diffAgainstFile(oldFilePath) {
  const fs = require("fs");

  if (!fs.existsSync(oldFilePath)) {
    throw new Error(`Old routing file not found: ${oldFilePath}`);
  }

  const oldGraph = JSON.parse(fs.readFileSync(oldFilePath, "utf