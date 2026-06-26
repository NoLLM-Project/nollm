// system/5_Function/validators/validate_sku_metadata.js

export function validateSKUMetadata(skuRegistry, metadataRegistry, spec, report) {

    for (const sku of Object.values(skuRegistry)) {

        const meta = metadataRegistry[sku.metadata_id];

        // Metadata must exist
        if (spec.metadata.metadata_id_must_exist) {
            if (!meta) {
                report.metadata.ok = false;
                report.metadata.errors.push(
                    `${sku.id} references missing metadata '${sku.metadata_id}'`
                );
                continue;
            }
        }

        // Metadata category must match SKU category
        if (spec.metadata.metadata_category_must_match_sku_category) {
            if (meta && meta.category !== sku.category) {
                report.metadata.ok = false;
                report.metadata.errors.push(
                    `${sku.id} metadata category '${meta.category}' does not match SKU category '${sku.category}'`
                );
            }
        }

        // Metadata must not contradict coordinates or naming
        if (spec.metadata.metadata_must_not_contradict_coordinates_or_naming) {
            if (meta && meta.object_id && meta.object_id !== sku.object_id) {
                report.metadata.ok = false;
                report.metadata.errors.push(
                    `${sku.id} metadata object_id '${meta.object_id}' contradicts SKU object_id '${sku.object_id}'`
                );
            }
        }
    }
}
