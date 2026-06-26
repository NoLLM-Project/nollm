// 1_Engine/engine_rules/engine_runtime.js
// Minimal evaluation pipeline for the rules engine.

function normalizeRequest(request) {
  if (request == null || typeof request !== "object") {
    return { input: request };
  }
  return request;
}

async function evaluatePredicate(predicateFn, context) {
  try {
    return Boolean(await predicateFn(context));
  } catch {
    return false;
  }
}

async function evaluateInvariants(invariants, predicates, context) {
  const triggered = [];

  for (const inv of invariants) {
    const predName = inv.when.ref;
    const predFn = predicates.get(predName);

    if (!predFn) continue;

    const ok = await evaluatePredicate(predFn, context);
    if (ok) triggered.push(inv);
  }

  return triggered;
}

function applyEffects(triggered, messages) {
  return triggered.map(inv => ({
    id: inv.id,
    severity: inv.effect.severity,
    message_key: inv.effect.message_key,
    message: messages.get(inv.effect.message_key) || null
  }));
}

async function runEngine(request, ruleset) {
  const context = normalizeRequest(request);

  const triggered = await evaluateInvariants(
    ruleset.invariants,
    ruleset.predicates,
    context
  );

  const effects = applyEffects(triggered, ruleset.messages);

  return {
    ok: effects.every(e => e.severity === "soft"),
    effects,
    count: effects.length
  };
}

module.exports = { runEngine };
