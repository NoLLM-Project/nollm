// system/5_Function/validators/validate_sku_object_mapping.js

import { loadJson } from "../../../utils/load_json.js";

// Loader: async, uses the single JSON primitive
export async function loadSKUObjectMappingData() {
    const canonicalNames = await loadJson("../../3_Registry/SKUs/sku_to_object_map.json");
    return { canonicalNames };
}

// Validator: pure, synchronous
export function validateSKUObjectMapping(
    skuRegistry,
    coordinateRegistry,
    metadataRegistry,
    spec,
    report,
    canonicalNames
) {

    for (const sku of Object.values(skuRegistry)) {

        // object_id must exist in canonical_names.json
        if (spec.object_mapping.object_id_must_exist_in_canonical_names_file) {
            if (!canonicalNames.allowed.includes(sku.object_id)) {
                report.object_mapping.ok = false;
                report.object_mapping.errors.push(
                    `${sku.id} object_id '${sku.object_id}' not found in canonical_names.json`
                );
            }
        }

        // coordinates must reference valid coordinate
        if (spec.object_mapping.coordinates_must_reference_valid_coordinate) {
            if (!coordinateRegistry[sku.coordinate_id]) {
                report.object_mapping.ok = false;
                report.object_mapping.errors.push(
                    `${sku.id} references invalid coordinate '${sku.coordinate_id}'`
                );
            }
        }

        // metadata must reference valid metadata
        if (spec.object_mapping.metadata_must_reference_valid_metadata) {
            if (!metadataRegistry[sku.metadata_id]) {
                report.object_mapping.ok = false;
                report.object_mapping.errors.push(
                    `${sku.id} references invalid metadata '${sku.metadata_id}'`
                );
            }
        }

        // category must match true type
        if (spec.object_mapping.category_must_match_true_type) {
            const meta = metadataRegistry[sku.metadata_id];
            if (meta && meta.category !== sku.category) {
                report.object_mapping.ok = false;
                report.object_mapping.errors.push(
                    `${sku.id} category '${sku.category}' does not match metadata category '${meta.category}'`
                );
            }
        }
    }
}
