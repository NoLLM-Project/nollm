// executor.js
// Executes the engine with provided mechanical inputs.

import { bootstrapEngine } from "./bootstrap.js";

export function execute(coordinates, content) {
    // Executes a single mechanical operation.
    bootstrapEngine(coordinates, content);
}
