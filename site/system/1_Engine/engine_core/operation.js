// operation.js
// Defines a mechanical operation wrapper.

import { runEngine } from "./engine.js";

export function performOperation(coordinates, content) {
    runEngine(coordinates, content);
    // Nothing persists after this call.
}
