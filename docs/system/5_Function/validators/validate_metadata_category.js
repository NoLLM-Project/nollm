// system/5_Function/validators/validate_metadata_category.js

import { loadJson } from "../../utils/load_json.js";

// Loader: async, uses the single JSON primitive
export async function loadMetadataCategoryData() {
    const metadataTypes = await loadJson("../3_Registry/Metadata/metadata_types.json");
    return metadataTypes;
}

// Validator: pure, synchronous
export function validateMetadataCategory(metadataRegistry, spec, report, metadataTypes) {

    for (const meta of Object.values(metadataRegistry)) {

        // Category matches true type
        if (spec.metadata_category.category_matches_true_type) {
            if (meta.category !== meta.true_type) {
                report.category.ok = false;
                report.category.errors.push(
                    `${meta.id} category '${meta.category}' does not match true type '${meta.true_type}'`
                );
            }
        }

        // Category exists in metadata_types.json
        if (spec.metadata_category.category_must_exist_in_file) {
            if (!metadataTypes.allowed.includes(meta.category)) {
                report.category.ok = false;
                report.category.errors.push(
                    `${meta.id} category '${meta.category}' not found in metadata_types.json`
                );
            }
        }

        // Category must not drift
        if (spec.metadata_category.category_must_not_drift) {
            if (meta.previous_category && meta.previous_category !== meta.category) {
                report.category.ok = false;
                report.category.errors.push(
                    `${meta.id} category drift detected: '${meta.previous_category}' → '${meta.category}'`
                );
            }
        }
    }
}
