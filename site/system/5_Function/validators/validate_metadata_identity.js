// system/5_Function/validators/validate_metadata_identity.js

export function validateMetadataIdentity(metadataRegistry, spec, report) {

    const ids = new Set();

    for (const meta of Object.values(metadataRegistry)) {

        // Unique ID
        if (spec.identity.unique_ids) {
            if (ids.has(meta.id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Duplicate metadata id: ${meta.id}`);
            }
            ids.add(meta.id);
        }

        // Name matches canonical
        if (spec.identity.name_matches_canonical) {
            if (meta.name !== meta.canonical_name) {
                report.identity.ok = false;
                report.identity.errors.push(
                    `${meta.id} name '${meta.name}' does not match canonical '${meta.canonical_name}'`
                );
            }
        }

        // Valid SKU reference
        if (spec.identity.require_valid_sku) {
            if (!meta.sku || typeof meta.sku !== "string") {
                report.identity.ok = false;
                report.identity.errors.push(`${meta.id} missing valid SKU reference`);
            }
        }

        // Valid coordinate reference
        if (spec.identity.require_valid_coordinate) {
            if (!meta.coordinate_id || typeof meta.coordinate_id !== "string") {
                report.identity.ok = false;
                report.identity.errors.push(`${meta.id} missing valid coordinate reference`);
            }
        }
    }
}
