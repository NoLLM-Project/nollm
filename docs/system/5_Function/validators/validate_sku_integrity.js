// system/5_Function/validators/validate_sku_integrity.js

export function validateSKUIntegrity(skuRegistry, coordinateRegistry, metadataRegistry, spec, report) {

    const pairs = new Set();

    for (const sku of Object.values(skuRegistry)) {

        // No orphan SKUs
        if (spec.integrity.no_orphan_skus) {
            if (!coordinateRegistry[sku.coordinate_id] || !metadataRegistry[sku.metadata_id]) {
                report.integrity.ok = false;
                report.integrity.errors.push(`${sku.id} is orphaned`);
            }
        }

        // No reference to nonexistent objects
        if (spec.integrity.no_reference_to_nonexistent_objects) {
            if (!sku.object_id) {
                report.integrity.ok = false;
                report.integrity.errors.push(`${sku.id} missing object_id`);
            }
        }

        // No duplicate coordinate + object pairs
        if (spec.integrity.no_duplicate_coordinate_object_pairs) {
            const key = `${sku.coordinate_id}:${sku.object_id}`;
            if (pairs.has(key)) {
                report.integrity.ok = false;
                report.integrity.errors.push(
                    `${sku.id} duplicates coordinate/object pair '${key}'`
                );
            }
            pairs.add(key);
        }

        // No violation of naming or coordinate invariants
        if (spec.integrity.no_violation_of_naming_or_coordinate_invariants) {
            const coord = coordinateRegistry[sku.coordinate_id];
            const meta = metadataRegistry[sku.metadata_id];

            if (coord && meta && coord.object_id && coord.object_id !== meta.object_id) {
                report.integrity.ok = false;
                report.integrity.errors.push(
                    `${sku.id} naming/coordinate mismatch between coordinate and metadata`
                );
            }
        }
    }
}
