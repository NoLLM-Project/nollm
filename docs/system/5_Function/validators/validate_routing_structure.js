// system/5_Function/validators/validate_routing_structure.js

export function validateRoutingStructure(routes, spec, report) {

    for (const r of routes) {

        // Non-empty id
        if (!r.id || r.id.trim() === "") {
            report.structure.ok = false;
            report.structure.errors.push(`Route has empty id`);
        }

        // Non-empty source
        if (!r.source || r.source.trim() === "") {
            report.structure.ok = false;
            report.structure.errors.push(`Route '${r.id}' has empty source`);
        }

        // Non-empty conditions
        if (!Array.isArray(r.conditions) || r.conditions.length === 0) {
            report.structure.ok = false;
            report.structure.errors.push(`Route '${r.id}' has no conditions`);
        }

        // Non-empty transitions
        if (!Array.isArray(r.transitions) || r.transitions.length === 0) {
            report.structure.ok = false;
            report.structure.errors.push(`Route '${r.id}' has no transitions`);
        }
    }
}
