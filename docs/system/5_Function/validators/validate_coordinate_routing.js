// system/5_Function/validators/validate_coordinate_routing.js

export function validateCoordinateRouting(coordinateRegistry, spec, report) {
    for (const [id, coord] of Object.entries(coordinateRegistry)) {

        // Hallways same floor
        if (coord.type === "hallway" && spec.routing.hallways_same_floor_only) {
            for (const adj of coord.adjacent || []) {
                const other = coordinateRegistry[adj];
                if (other && other.z !== coord.z) {
                    report.routing.ok = false;
                    report.routing.errors.push(
                        `Hallway ${id} connects to ${adj} on different z`
                    );
                }
            }
        }

        // Rooms connect only to hallways
        if (coord.type === "room" && spec.routing.rooms_connect_to_hallways_only) {
            for (const adj of coord.adjacent || []) {
                const other = coordinateRegistry[adj];
                if (other && other.type !== "hallway") {
                    report.routing.ok = false;
                    report.routing.errors.push(
                        `Room ${id} connects to non-hallway ${adj}`
                    );
                }
            }
        }
    }
}
