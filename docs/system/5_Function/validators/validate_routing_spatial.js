// system/5_Function/validators/validate_routing_spatial.js

export function validateRoutingSpatial(routes, coordinateRegistry, spec, report) {

    for (const r of routes) {

        const src = coordinateRegistry[r.source];
        const tgt = coordinateRegistry[r.target];
        if (!src || !tgt) continue;

        // World → World stays world-plane
        if (spec.spatial_routing.world_to_world_stays_world_plane) {
            if (src.type === "world" && tgt.type !== "world") {
                report.spatial_routing.ok = false;
                report.spatial_routing.errors.push(
                    `${r.id} violates world→world invariant`
                );
            }
        }

        // World → Hotel must pass through hotel_shell
        if (spec.spatial_routing.world_to_hotel_must_pass_through_hotel_shell) {
            if (src.type === "world" && tgt.type === "hotel" && !r.via?.includes("hotel_shell")) {
                report.spatial_routing.ok = false;
                report.spatial_routing.errors.push(
                    `${r.id} world→hotel must pass through hotel_shell`
                );
            }
        }

        // Hotel → Floor must use valid hotel-floor coordinates
        if (spec.spatial_routing.hotel_to_floor_must_use_valid_hotel_floor_coordinates) {
            if (src.type === "hotel" && tgt.type === "floor" && !tgt.is_hotel_floor) {
                report.spatial_routing.ok = false;
                report.spatial_routing.errors.push(
                    `${r.id} hotel→floor uses invalid floor coordinate`
                );
            }
        }

        // Floor → Floor must follow vertical adjacency
        if (spec.spatial_routing.floor_to_floor_must_follow_vertical_adjacency) {
            if (src.type === "floor" && tgt.type === "floor") {
                if (Math.abs(src.level - tgt.level) !== 1) {
                    report.spatial_routing.ok = false;
                    report.spatial_routing.errors.push(
                        `${r.id} floor→floor violates vertical adjacency`
                    );
                }
            }
        }

        // Room → Hallway adjacency
        if (spec.spatial_routing.room_to_hallway_must_follow_adjacency_rules) {
            if (src.type === "room" && tgt.type === "hallway" && !src.adjacent.includes(tgt.id)) {
                report.spatial_routing.ok = false;
                report.spatial_routing.errors.push(
                    `${r.id} room→hallway violates adjacency`
                );
            }
        }

        // Skeletons not navigable
        if (spec.spatial_routing.skeletons_not_navigable) {
            if (src.type === "skeleton" || tgt.type === "skeleton") {
                report.spatial_routing.ok = false;
                report.spatial_routing.errors.push(
                    `${r.id} skeleton nodes cannot be routed`
                );
            }
        }
    }
}
