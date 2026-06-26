// engine.js
// Mechanical executor. No semantics. No interpretation.

import { createWalker } from "./coordinate_walker.js";
import { createCarrier } from "./carrier.js";
import { createMovementCore } from "./movement_core.js";

export function runEngine(coordinates, content) {
    const carrier = createCarrier(content);
    const walker = createWalker(coordinates);
    const movementCore = createMovementCore();

    while (walker.hasNext()) {
        const coordName = walker.next();

        // NEW: spatial movement
        movementCore.moveToCoord(coordName);

        // Existing: carrier movement (still mechanical)
        carrier.moveTo(coordName);
    }

    // When movement ends, the engine discards everything.
    carrier.clear();
}
