// system/5_Function/validators/validate_sku_coordinates.js

export function validateSKUCoordinates(skuRegistry, coordinateRegistry, spec, report) {

    for (const sku of Object.values(skuRegistry)) {

        const coord = coordinateRegistry[sku.coordinate_id];
        if (!coord) continue;

        // Coordinate must match true location
        if (spec.coordinates.coordinate_must_match_true_location) {
            if (coord.object_id && coord.object_id !== sku.object_id) {
                report.coordinates.ok = false;
                report.coordinates.errors.push(
                    `${sku.id} coordinate '${sku.coordinate_id}' does not match object '${sku.object_id}'`
                );
            }
        }

        // Spatial objects require numeric xyz
        if (spec.coordinates.spatial_objects_require_numeric_xyz) {
            if (coord.type === "spatial") {
                if (typeof coord.x !== "number" || typeof coord.y !== "number" || typeof coord.z !== "number") {
                    report.coordinates.ok = false;
                    report.coordinates.errors.push(
                        `${sku.id} spatial coordinate '${sku.coordinate_id}' has non-numeric xyz`
                    );
                }
            }
        }

        // Abstract objects require null xyz
        if (spec.coordinates.abstract_objects_require_null_xyz) {
            if (coord.type === "abstract") {
                if (coord.x !== null || coord.y !== null || coord.z !== null) {
                    report.coordinates.ok = false;
                    report.coordinates.errors.push(
                        `${sku.id} abstract coordinate '${sku.coordinate_id}' has non-null xyz`
                    );
                }
            }
        }
    }
}
