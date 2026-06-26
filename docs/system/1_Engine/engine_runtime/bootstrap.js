// bootstrap.js
// Prepares the engine for a single mechanical run.

import { performOperation } from "../engine_core/operation.js";

export function bootstrapEngine(coordinates, content) {
    // No state is retained. No semantics. No interpretation.
    performOperation(coordinates, content);
}
