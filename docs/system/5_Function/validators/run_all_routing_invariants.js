// system/5_Function/validators/run_all_routing_invariants.js

import { loadRoutingInvariants } from "./load_routing_invariants.js";
import { validateRoutingIdentity } from "./validate_routing_identity.js";
import { validateRoutingStructure } from "./validate_routing_structure.js";
import { validateRoutingSpatial } from "./validate_routing_spatial.js";
import { validateRoutingUI } from "./validate_routing_ui.js";
import { validateRoutingService } from "./validate_routing_service.js";
import { validateRoutingProfiles } from "./validate_routing_profiles.js";
import { validateRoutingTransitions } from "./validate_routing_transitions.js";
import { validateRoutingIntegrity } from "./validate_routing_integrity.js";

export function runAllRoutingInvariants(routes, canonicalRegistry, coordinateRegistry) {

    const spec = loadRoutingInvariants();

    const report = {
        identity: { ok: true, errors: [] },
        structure: { ok: true, errors: [] },
        spatial_routing: { ok: true, errors: [] },
        ui_routing: { ok: true, errors: [] },
        service_routing: { ok: true, errors: [] },
        profiles: { ok: true, errors: [] },
        transitions: { ok: true, errors: [] },
        integrity: { ok: true, errors: [] },
        overall_ok: true
    };

    validateRoutingIdentity(routes, canonicalRegistry, spec, report);
    validateRoutingStructure(routes, spec, report);
    validateRoutingSpatial(routes, coordinateRegistry, spec, report);
    validateRoutingUI(routes, spec, report);
    validateRoutingService(routes, spec, report);
    validateRoutingProfiles(routes, spec, report);
    validateRoutingTransitions(routes, spec, report);
    validateRoutingIntegrity(routes, coordinateRegistry, spec, report);

    report.overall_ok = Object.values(report)
        .filter(s => typeof s === "object" && "ok" in s)
        .every(s => s.ok);

    return report;
}
