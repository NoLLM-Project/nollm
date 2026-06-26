// system/5_Function/validators/validate_routing_integrity.js

export function validateRoutingIntegrity(routes, coordinateRegistry, spec, report) {

    for (const r of routes) {

        const src = coordinateRegistry[r.source];
        const tgt = coordinateRegistry[r.target];
        if (!src || !tgt) continue;

        // No bypassing required layers
        if (spec.integrity.no_route_may_bypass_required_layers) {
            if (src.type === "world" && tgt.type === "room") {
                report.integrity.ok = false;
                report.integrity.errors.push(
                    `${r.id} bypasses required layers (world→room)`
                );
            }
        }

        // No cycles in world→hotel→floor→room hierarchy
        if (spec.integrity.no_route_may_create_cycles_in_world_hotel_floor_room_hierarchy) {
            if (src.type === "room" && tgt.type === "world") {
                report.integrity.ok = false;
                report.integrity.errors.push(
                    `${r.id} creates cycle (room→world)`
                );
            }
        }

        // No adjacency contradictions
        if (spec.integrity.no_route_may_contradict_adjacency_rules) {
            if (src.adjacent && !src.adjacent.includes(tgt.id)) {
                report.integrity.ok = false;
                report.integrity.errors.push(
                    `${r.id} contradicts adjacency rules`
                );
            }
        }
    }
}
