// system/5_Function/validators/validate_spatial.js

export function validateSpatial(graph, spec, report) {

    for (const node of Object.values(graph)) {

        const parent = graph[node.parent];

        // xyz consistency
        if (spec.spatial.xyz_consistent_with_parent && parent) {
            if (typeof node.x === "number" && typeof parent.x === "number") {
                // No specific rule beyond "consistent", so we check for NaN or undefined
                if (Number.isNaN(node.x) || Number.isNaN(node.y) || Number.isNaN(node.z)) {
                    report.spatial.ok = false;
                    report.spatial.errors.push(`${node.id} has invalid xyz values`);
                }
            }
        }

        // Floors monotonic z
        if (node.type === "floor" && spec.spatial.floors_monotonic_z) {
            // We assume floors are named floor_01, floor_02, etc.
            // You can replace this with your own floor ordering logic.
            const floorNum = parseInt(node.id.replace(/\D+/g, ""), 10);
            if (floorNum !== node.z) {
                report.spatial.ok = false;
                report.spatial.errors.push(`${node.id} z=${node.z} does not match floor number ${floorNum}`);
            }
        }

        // Rooms match parent floor z
        if (node.type === "room" && spec.spatial.rooms_match_parent_floor_z) {
            if (parent && node.z !== parent.z) {
                report.spatial.ok = false;
                report.spatial.errors.push(`${node.id} z=${node.z} does not match parent floor z=${parent.z}`);
            }
        }

        // Hallways match parent floor z
        if (node.type === "hallway" && spec.spatial.hallways_match_parent_floor_z) {
            if (parent && node.z !== parent.z) {
                report.spatial.ok = false;
                report.spatial.errors.push(`${node.id} hallway z=${node.z} does not match parent floor z=${parent.z}`);
            }
        }
    }
}
