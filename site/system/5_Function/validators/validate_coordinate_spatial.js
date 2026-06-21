// system/5_Function/validators/validate_coordinate_spatial.js

export function validateCoordinateSpatial(coordinateRegistry, spec, report) {
    for (const [id, coord] of Object.entries(coordinateRegistry)) {
        const parent = coordinateRegistry[coord.parent];

        // Numeric xyz consistency
        if (spec.spatial.require_numeric_xyz_consistency && parent) {
            if (typeof coord.z === "number" && typeof parent.z === "number") {
                // Floors monotonic
                if (coord.type === "floor" && coord.z <= parent.z) {
                    report.spatial.ok = false;
                    report.spatial.errors.push(
                        `Floor ${id} has non-increasing z relative to parent ${coord.parent}`
                    );
                }
            }
        }

        // Rooms share parent z
        if (coord.type === "room" && spec.spatial.rooms_share_parent_z) {
            if (parent && coord.z !== parent.z) {
                report.spatial.ok = false;
                report.spatial.errors.push(
                    `Room ${id} z=${coord.z} does not match parent floor z=${parent.z}`
                );
            }
        }

        // Hallways share parent z
        if (coord.type === "hallway" && spec.spatial.hallways_share_parent_z) {
            if (parent && coord.z !== parent.z) {
                report.spatial.ok = false;
                report.spatial.errors.push(
                    `Hallway ${id} z=${coord.z} does not match parent floor z=${parent.z}`
                );
            }
        }

        // Vertical circulation match floors
        if (["stairs", "elevator"].includes(coord.type) &&
            spec.spatial.vertical_circulation_match_floors) {
            for (const adj of coord.adjacent || []) {
                const adjCoord = coordinateRegistry[adj];
                if (adjCoord && typeof adjCoord.z === "number") {
                    if (Math.abs(adjCoord.z - coord.z) > 1) {
                        report.spatial.ok = false;
                        report.spatial.errors.push(
                            `Vertical circulation ${id} connects to non-adjacent floor ${adj}`
                        );
                    }
                }
            }
        }
    }
}
