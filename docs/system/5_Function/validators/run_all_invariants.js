// system/5_Function/validators/run_all_invariants.js

import { loadCoordinateInvariants } from "./load_coordinate_invariants.js";
import { validateIdentityAndHierarchy } from "./validate_identity_hierarchy.js";
import { validateSpatial } from "./validate_spatial.js";
import { validateAdjacency } from "./validate_adjacency.js";
import { validateAbstractSpace } from "./validate_abstract.js";
import { validateRouting } from "./validate_routing.js";
import { validateIntegrity } from "./validate_integrity.js";
import { validateMetadata } from "./validate_metadata.js";
import { validateProfiles } from "./validate_profiles.js";

export function runAllInvariants(graph, workflowContext) {

    const spec = loadCoordinateInvariants();

    const report = {
        identity: { ok: true, errors: [] },
        hierarchy: { ok: true, errors: [] },
        spatial: { ok: true, errors: [] },
        adjacency: { ok: true, errors: [] },
        abstract: { ok: true, errors: [] },
        routing: { ok: true, errors: [] },
        integrity: { ok: true, errors: [] },
        metadata: { ok: true, errors: [] },
        profile: { ok: true, errors: [] },
        overall_ok: true
    };

    validateIdentityAndHierarchy(graph, spec, report);
    validateSpatial(graph, spec, report);
    validateAdjacency(graph, spec, report);
    validateAbstractSpace(graph, spec, report);
    validateRouting(graph, spec, report);
    validateIntegrity(graph, spec, report);
    validateMetadata(graph, workflowContext.sku_metadata_map, report);
    validateProfiles(workflowContext, workflowContext.profile_constraints, report);

    report.overall_ok = Object.values(report)
        .filter(s => typeof s === "object" && "ok" in s)
        .every(s => s.ok);

    return report;
}
