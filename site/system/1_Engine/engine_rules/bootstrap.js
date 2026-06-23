// system/engine/bootstrap.js
// Tiny, inert bootstrap that loads the ruleset and exposes a run() entrypoint.

const path = require("path");
const { loadRuleset } = require("./rule_loader");
const { runEngine } = require("./engine_runtime"); // this will be built next

// Root of the project (NoLLM root)
const ROOT = path.resolve(__dirname, "../../");

let RULESET = null;

// ---------------------------------------------
// Initialize once
// ---------------------------------------------
function init() {
  if (RULESET) return RULESET; // idempotent

  RULESET = loadRuleset(ROOT);

  return RULESET;
}

// ---------------------------------------------
// Public entrypoint
// ---------------------------------------------
async function run(request) {
  const ruleset = init();
  return await runEngine(request, ruleset);
}

module.exports = {
  init,
  run
};
