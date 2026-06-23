// system/5_Function/validators/run_all_placement_invariants.js

import { loadPlacementInvariants } from "./load_placement_invariants.js";
import { validatePlacementIdentity } from "./validate_placement_identity.js";
import { validatePlacementStructural } from "./validate_placement_structural.js";
import { validatePlacementConstraints } from "./validate_placement_constraints.js";
import { validatePlacementInvariants } from "./validate_placement_invariants.js";
import { validatePlacementIntegrity } from "./validate_placement_integrity.js";

export function runAllPlacementInvariants(placementRegistry, coordinateRegistry) {

    // Load the JSON spec (match other validators)
    const spec = loadPlacementInvariants();

    const report = {
        identity: { ok: true, errors: [] },
        structural: { ok: true, errors: [] },
        constraints: { ok: true, errors: [] },
        invariants: { ok: true, errors: [] },
        integrity: { ok: true, errors: [] },
        overall_ok: true
    };

    validatePlacementIdentity(placementRegistry, spec, report);
    validatePlacementStructural(placementRegistry, coordinateRegistry, spec, report);
    validatePlacementConstraints(placementRegistry, spec, report);
    validatePlacementInvariants(placementRegistry, coordinateRegistry, spec, report);
    validatePlacementIntegrity(placementRegistry, spec, report);

    report.overall_ok = Object.values(report)
        .filter(s => typeof s === "object" && "ok" in s)
        .every(s => s.ok);

    return report;
}
