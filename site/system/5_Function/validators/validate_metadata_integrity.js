// system/5_Function/validators/validate_metadata_integrity.js

export function validateMetadataIntegrity(metadataRegistry, spec, report) {

    const ids = new Set();

    for (const meta of Object.values(metadataRegistry)) {

        // No orphan metadata
        if (spec.integrity.no_orphan_metadata) {
            if (!meta.sku || !meta.coordinate_id) {
                report.integrity.ok = false;
                report.integrity.errors.push(`${meta.id} is orphaned`);
            }
        }

        // No contradictions
        if (spec.integrity.no_contradictions_with_naming_coordinates_skus) {
            if (meta.name !== meta.canonical_name) {
                report.integrity.ok = false;
                report.integrity.errors.push(`${meta.id} naming contradiction`);
            }
        }

        // No duplicates
        if (spec.integrity.no_duplicate_metadata_objects) {
            const key = `${meta.name}:${meta.category}:${meta.sku}`;
            if (ids.has(key)) {
                report.integrity.ok = false;
                report.integrity.errors.push(`${meta.id} duplicates another metadata object`);
            }
            ids.add(key);
        }
    }
}
