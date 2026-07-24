// system/5_Function/validators/validate_coordinate_abstract.js

export function validateCoordinateAbstract(coordinateRegistry, spec, report) {
    for (const [id, coord] of Object.entries(coordinateRegistry)) {
        if (coord.type !== "abstract") continue;

        // xyz must be null
        if (spec.abstract.xyz_must_be_null) {
            if (coord.x !== null || coord.y !== null || coord.z !== null) {
                report.abstract.ok = false;
                report.abstract.errors.push(
                    `Abstract coordinate ${id} must have x=y=z=null`
                );
            }
        }

        // No adjacency to spatial
        if (spec.abstract.no_spatial_adjacency) {
            for (const adj of coord.adjacent || []) {
                const other = coordinateRegistry[adj];
                if (other && other.type !== "abstract") {
                    report.abstract.ok = false;
                    report.abstract.errors.push(
                        `Abstract ${id} adjacent to spatial node ${adj}`
                    );
                }
            }
        }
    }
}
