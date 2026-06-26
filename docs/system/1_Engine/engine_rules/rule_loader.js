// system/engine/rule_loader.js
// Contract-aware loader for 0_Rules:
// - Invariants
// - Predicates
// - Messages

const fs = require("fs");
const path = require("path");

function walk(dir, filterFn = () => true) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      results.push(...walk(full, filterFn));
    } else if (filterFn(full)) {
      results.push(full);
    }
  }
  return results;
}

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// -----------------------------
// Invariants
// -----------------------------

function loadInvariants(baseDir) {
  const invBase = path.join(baseDir, "Invariants");
  const files = walk(invBase, f => f.endsWith(".json"));

  const invariants = [];

  for (const file of files) {
    const inv = loadJSON(file);

    // Minimal contract check
    if (!inv.id || !inv.layer || !inv.when || !inv.when.ref || !inv.effect) {
      // Skip malformed invariants; engine can log later
      continue;
    }

    invariants.push({
      ...inv,
      __file: file // keep source path for debugging
    });
  }

  return invariants;
}

// -----------------------------
// Predicates
// -----------------------------

function loadPredicates(baseDir) {
  const predBase = path.join(baseDir, "Predicates");
  const files = walk(predBase, f => f.endsWith(".js"));

  const predicates = new Map(); // name -> fn

  for (const file of files) {
    const name = path.basename(file, ".js"); // <layer>.<domain>.<name>
    try {
      const fn = require(file);
      if (typeof fn !== "function") continue;
      predicates.set(name, fn);
    } catch {
      // Skip broken predicate modules; engine can log later
      continue;
    }
  }

  return predicates;
}

// -----------------------------
// Messages
// -----------------------------

function loadMessages(baseDir) {
  const msgBase = path.join(baseDir, "ConciergeMessages");
  const files = walk(msgBase, f => f.endsWith(".json"));

  const messages = new Map(); // key -> string

  for (const file of files) {
    const json = loadJSON(file);
    for (const [key, value] of Object.entries(json)) {
      if (typeof value !== "string") continue;
      messages.set(key, value);
    }
  }

  return messages;
}

// -----------------------------
// Aggregate loader
// -----------------------------

function loadRuleset(rootDir) {
  const rulesBase = path.join(rootDir, "system/0_Rules");

  const invariants = loadInvariants(rulesBase);
  const predicates = loadPredicates(rulesBase);
  const messages = loadMessages(rulesBase);

  return {
    invariants,
    predicates,
    messages
  };
}

module.exports = {
  loadInvariants,
  loadPredicates,
  loadMessages,
  loadRuleset
};
