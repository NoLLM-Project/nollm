// system/runner.js — fully structured, two‑plane runner

import { pathRegistry } from "./3_Registry/path_registry.js";
import { createCoordRegistry } from "./3_Registry/coord_registry.js";
import { PATH_FORWARD, PATH_PREPROCESS, PATH_POSTPROCESS, PATH_ATOMIZE, PATH_REVERSE } from "./1_Engine/paths.js";
import { ROUTER as behaviorMap } from "./router.js";
import { createCarrier } from "./1_Engine/engine_core/carrier.js";

export async function runWorkflow(initialPayload, userToken) {

  try {

    // ------------------------------------------------------------
    // SETUP
    // ------------------------------------------------------------
    const coordRegistry = await createCoordRegistry();
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

        // ------------------------------------------------------------
        // WORKFLOW ARRAY HANDLING (PATH_PREPROCESS, PATH_POSTPROCESS, PATH_ATOMIZE)
        // ------------------------------------------------------------
        if (next_path.startsWith("PATH_")) {

            const workflowArray = {
                PATH_PREPROCESS,
                PATH_POSTPROCESS,
                PATH_ATOMIZE
            }[next_path];

            if (!workflowArray) {
                throw new Error(`Unknown workflow array: ${next_path}`);
            }

            for (const step of workflowArray) {

                // Terminal instruction: { end: "coord_xxx" }
                if (typeof step === "object" && step.end) {
                    const endCoordId = step.end;
                    const endCoordEntry = coordRegistry[endCoordId];
                    if (!endCoordEntry) {
                        throw new Error(`Unknown coord in workflow end: ${endCoordId}`);
                    }

                    const xyz = endCoordEntry.xyz;
                    await carrier.moveTo(xyz);

                    const fn = behaviorMap[endCoordId];
                    if (!fn) {
                        throw new Error(`No behavior function for coord: ${endCoordId}`);
                    }

                    const result = fn({
                        workflowContext,
                        carrier,
                        userToken,
                        xyz
                    });

                    workflowContext[endCoordId] = result;

                    next_path = result?.next_path || null;
                    continue;
                }

                // Normal coord step
                const coordId = step;
                const coordEntry = coordRegistry[coordId];
                if (!coordEntry) {
                    throw new Error(`Unknown coord in workflow array: ${coordId}`);
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
            }

            continue;
        }

        // ------------------------------------------------------------
        // NORMAL HOTEL-PLANE PATH HANDLING
        // ------------------------------------------------------------
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
    // PHASE 3 — RETURN PIPELINE (PATH_REVERSE)
    // ------------------------------------------------------------
    for (const coordId of PATH_REVERSE) {

        const coordEntry = coordRegistry[coordId];
        if (!coordEntry) {
            throw new Error(`Unknown coord in PATH_REVERSE: ${coordId}`);
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
    }

    // ------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------
    carrier.clear();

    return workflowContext;

  } catch (err) {

    console.error("runWorkflow error:", err);
    throw err;
  }
}
