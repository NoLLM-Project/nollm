// system/5_Function/validators/validate_metadata_sku.js

export function validateMetadataSKU(metadataRegistry, skuRegistry, spec, report) {

    for (const meta of Object.values(metadataRegistry)) {

        const sku = skuRegistry[meta.sku];

        // SKU must map back to same object
        if (spec.sku.sku_must_map_back_to_same_object) {
            if (!sku || sku.metadata_id !== meta.id) {
                report.sku.ok = false;
                report.sku.errors.push(
                    `${meta.id} SKU '${meta.sku}' does not map back to same metadata object`
                );
            }
        }

        // SKU category must match metadata category
        if (spec.sku.sku_category_must_match_metadata_category) {
            if (sku && sku.category !== meta.category) {
                report.sku.ok = false;
                report.sku.errors.push(
                    `${meta.id} SKU category '${sku.category}' does not match metadata category '${meta.category}'`
                );
            }
        }
    }
}
