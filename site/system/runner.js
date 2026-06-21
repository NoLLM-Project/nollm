// system/runner.js v6 — fully structured, two‑plane runner

import { pathRegistry } from "./3_Registry/path_registry.js";  
import { coordRegistry } from "./3_Registry/coord_registry.js";
import { PATH_FORWARD } from "./1_Engine/paths.js";             // intake pipeline
import { ROUTER as behaviorMap } from "./router.js";     
import { createCarrier } from "./1_Engine/engine_core/carrier.js"; // movement engine

export async function runWorkflow(initialPayload, userToken) {

    // ------------------------------------------------------------
    // SETUP
    // ------------------------------------------------------------
    const carrier = createCarrier(initialPayload);
    const workflowContext = {};

    // ------------------------------------------------------------
    // PHASE 1 — INTAKE PIPELINE (PATH_FORWARD)
    // ------------------------------------------------------------
    for (const coordId of PATH_FORWARD) {

        const coordEntry = coordRegistry[coordId];
        if (!coordEntry) {
            throw new Error(`Unknown coord in PATH_FORWARD: ${coordId}`);
        }

        const xyz = coordEntry.xyz;
        await carrier.moveTo(xyz);

        const fn = behaviorMap[coordId];
        if (!fn) {
            throw new Error(`No behavior function for coord: ${coordId}`);
        }

        const result = fn({
            workflowContext,
            carrier,
            userToken,
            xyz
        });

        workflowContext[coordId] = result;

        // STOP when we reach front desk — hotel-plane takes over after this
        if (coordId === "coord_front_desk") {
            break;
        }
    }

    // ------------------------------------------------------------
    // PHASE 2 — HOTEL PLANE (dynamic next_path routing)
    // ------------------------------------------------------------
    let next_path = workflowContext["coord_front_desk"]?.next_path || null;

    while (next_path) {

        const pathEntry = pathRegistry[next_path];
        if (!pathEntry) {
            throw new Error(`Unknown hotel path: ${next_path}`);
        }

        const coordId = pathEntry.coord;
        const coordEntry = coordRegistry[coordId];
        if (!coordEntry) {
            throw new Error(`Unknown coord in hotel-plane: ${coordId}`);
        }

        const xyz = coordEntry.xyz;
        await carrier.moveTo(xyz);

        const fn = behaviorMap[coordId];
        if (!fn) {
            throw new Error(`No behavior function for coord: ${coordId}`);
        }

        const result = fn({
            workflowContext,
            carrier,
            userToken,
            xyz
        });

        workflowContext[coordId] = result;

        next_path = result?.next_path || null;
    }

    // ------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------
    carrier.clear();

    return workflowContext;
}
