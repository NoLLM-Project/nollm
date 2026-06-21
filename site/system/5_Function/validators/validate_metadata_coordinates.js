// system/5_Function/validators/validate_metadata_coordinates.js

export function validateMetadataCoordinates(metadataRegistry, skuRegistry, spec, report) {

    for (const meta of Object.values(metadataRegistry)) {

        const sku = skuRegistry[meta.sku];
        if (!sku) continue;

        // Metadata coordinates must match SKU coordinates
        if (spec.coordinates.metadata_coordinates_match_sku_coordinates) {
            if (meta.x !== sku.x || meta.y !== sku.y || meta.z !== sku.z) {
                report.coordinates.ok = false;
                report.coordinates.errors.push(
                    `${meta.id} metadata xyz does not match SKU xyz`
                );
            }
        }

        // Spatial objects require numeric xyz
        if (spec.coordinates.spatial_objects_require_numeric_xyz) {
            if (meta.category === "spatial") {
                if (typeof meta.x !== "number" || typeof meta.y !== "number" || typeof meta.z !== "number") {
                    report.coordinates.ok = false;
                    report.coordinates.errors.push(
                        `${meta.id} is spatial but xyz are not numeric`
                    );
                }
            }
        }

        // Abstract objects require null xyz
        if (spec.coordinates.abstract_objects_require_null_xyz) {
            if (meta.category === "abstract") {
                if (meta.x !== null || meta.y !== null || meta.z !== null) {
                    report.coordinates.ok = false;
                    report.coordinates.errors.push(
                        `${meta.id} is abstract but xyz are not null`
                    );
                }
            }
        }
    }
}
