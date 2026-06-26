// system/5_Function/validators/validate_routing_service.js

export function validateRoutingService(routes, spec, report) {

    for (const r of routes) {

        // Concierge → service behaviors only
        if (spec.service_routing.concierge_routes_only_to_service_behaviors) {
            if (r.source === "concierge" && r.target_type !== "service_behavior") {
                report.service_routing.ok = false;
                report.service_routing.errors.push(
                    `${r.id} concierge routes to non-service behavior`
                );
            }
        }

        // Directory/Vending/Bulletin → their behaviors only
        if (spec.service_routing.directory_vending_bulletin_route_only_to_their_behaviors) {
            if (["directory", "vending", "bulletin"].includes(r.source_type)
                && r.target_type !== "service_behavior") {
                report.service_routing.ok = false;
                report.service_routing.errors.push(
                    `${r.id} service node routes to non-service behavior`
                );
            }
        }

        // Service behaviors must not route to world/floor
        if (spec.service_routing.service_behaviors_must_not_route_to_world_or_floor_objects) {
            if (r.source_type === "service_behavior" &&
                ["world", "floor"].includes(r.target_type)) {
                report.service_routing.ok = false;
                report.service_routing.errors.push(
                    `${r.id} service_behavior routes to world/floor`
                );
            }
        }
    }
}
