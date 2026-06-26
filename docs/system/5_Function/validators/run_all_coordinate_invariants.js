// system/5_Function/validators/run_all_coordinate_invariants.js

import { loadCoordinateInvariants } from "./load_coordinate_invariants.js";

import { validateCoordinateIdentity } from "./validate_coordinate_identity.js";
import { validateCoordinateHierarchy } from "./validate_coordinate_hierarchy.js";
import { validateCoordinateSpatial } from "./validate_coordinate_spatial.js";
import { validateCoordinateAdjacency } from "./validate_coordinate_adjacency.js";
import { validateCoordinateAbstract } from "./validate_coordinate_abstract.js";
import { validateCoordinateRouting } from "./validate_coordinate_routing.js";
import { validateCoordinateIntegrity } from "./validate_coordinate_integrity.js";

export async function runAllCoordinateInvariants(coordinateRegistry) {

    // Load the JSON spec (async)
    const spec = await loadCoordinateInvariants();

    // Initialize report structure
    const report = {
        identity: { ok: true, errors: [] },
        structure: { ok: true, errors: [] },
        spatial: { ok: true, errors: [] },
        adjacency: { ok: true, errors: [] },
        abstract: { ok: true, errors: [] },
        routing: { ok: true, errors: [] },
        integrity: { ok: true, errors: [] },
        overall_ok: true
    };

    // Run all validators
    validateCoordinateIdentity(coordinateRegistry, spec, report);
    validateCoordinateHierarchy(coordinateRegistry, spec, report);
    validateCoordinateSpatial(coordinateRegistry, spec, report);
    validateCoordinateAdjacency(coordinateRegistry, spec, report);
    validateCoordinateAbstract(coordinateRegistry, spec, report);
    validateCoordinateRouting(coordinateRegistry, spec, report);
    validateCoordinateIntegrity(coordinateRegistry, spec, report);

    // Compute overall_ok
    report.overall_ok = Object.values(report)
        .filter(section => typeof section === "object" && "ok" in section)
        .every(section => section.ok);

    return report;
}
