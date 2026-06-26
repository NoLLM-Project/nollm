// system/5_Function/validators/validate_sku_identity.js

export function validateSKUIdentity(skuRegistry, spec, report) {

    const ids = new Set();

    for (const sku of Object.values(skuRegistry)) {

        // Unique SKU ID
        if (spec.identity.unique_sku_ids) {
            if (ids.has(sku.id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Duplicate SKU id: ${sku.id}`);
            }
            ids.add(sku.id);
        }

        // Must map to exactly one object
        if (spec.identity.map_to_exactly_one_object) {
            if (!sku.object_id || typeof sku.object_id !== "string") {
                report.identity.ok = false;
                report.identity.errors.push(`${sku.id} missing valid object_id`);
            }
        }

        // Must map to exactly one coordinate
        if (spec.identity.map_to_exactly_one_coordinate) {
            if (!sku.coordinate_id || typeof sku.coordinate_id !== "string") {
                report.identity.ok = false;
                report.identity.errors.push(`${sku.id} missing valid coordinate_id`);
            }
        }

        // Must map to exactly one metadata
        if (spec.identity.map_to_exactly_one_metadata) {
            if (!sku.metadata_id || typeof sku.metadata_id !== "string") {
                report.identity.ok = false;
                report.identity.errors.push(`${sku.id} missing valid metadata_id`);
            }
        }

        // Must map to exactly one category
        if (spec.identity.map_to_exactly_one_category) {
            if (!sku.category || typeof sku.category !== "string") {
                report.identity.ok = false;
                report.identity.errors.push(`${sku.id} missing valid category`);
            }
        }

        // Must map to exactly one version
        if (spec.identity.map_to_exactly_one_version) {
            if (!sku.version || typeof sku.version !== "string") {
                report.identity.ok = false;
                report.identity.errors.push(`${sku.id} missing valid version`);
            }
        }

        // SKU stability
        if (spec.identity.sku_stability_required) {
            if (sku.previous_id && sku.previous_id !== sku.id) {
                report.identity.ok = false;
                report.identity.errors.push(`${sku.id} changed identity from previous_id`);
            }
        }
    }
}
