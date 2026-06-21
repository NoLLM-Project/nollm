// system/5_Function/validators/validate_routing_identity.js

export function validateRoutingIdentity(routes, canonicalRegistry, spec, report) {

    const ids = new Set();

    for (const r of routes) {

        // Unique route IDs
        if (spec.identity.unique_route_ids) {
            if (ids.has(r.id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Duplicate route id '${r.id}'`);
            }
            ids.add(r.id);
        }

        // Source/target reference canonical names
        if (spec.identity.source_target_reference_canonical_names) {
            if (!canonicalRegistry[r.source]) {
                report.identity.ok = false;
                report.identity.errors.push(
                    `${r.id} references invalid source canonical '${r.source}'`
                );
            }
            if (!canonicalRegistry[r.target]) {
                report.identity.ok = false;
                report.identity.errors.push(
                    `${r.id} references invalid target canonical '${r.target}'`
                );
            }
        }

        // Schema compliance (minimal structural check)
        if (spec.identity.routes_must_follow_routing_schema) {
            if (!Array.isArray(r.conditions) || !Array.isArray(r.transitions)) {
                report.identity.ok = false;
                report.identity.errors.push(
                    `${r.id} does not follow routing schema (conditions/transitions)`
                );
            }
        }
    }
}
