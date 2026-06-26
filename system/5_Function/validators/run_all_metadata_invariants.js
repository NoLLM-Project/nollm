// system/5_Function/validators/run_all_metadata_invariants.js

import { loadMetadataInvariants } from "./load_metadata_invariants.js";
import { validateMetadataIdentity } from "./validate_metadata_identity.js";
import { validateMetadataAnchors } from "./validate_metadata_anchors.js";
import { validateMetadataCategory } from "./validate_metadata_category.js";
import { validateMetadataProperties } from "./validate_metadata_properties.js";
import { validateMetadataCoordinates } from "./validate_metadata_coordinates.js";
import { validateMetadataSKU } from "./validate_metadata_sku.js";
import { validateMetadataIntegrity } from "./validate_metadata_integrity.js";

export function runAllMetadataInvariants(metadataRegistry, skuRegistry) {

    const spec = loadMetadataInvariants();

    const report = {
        identity: { ok: true, errors: [] },
        anchors: { ok: true, errors: [] },
        category: { ok: true, errors: [] },
        properties: { ok: true, errors: [] },
        coordinates: { ok: true, errors: [] },
        sku: { ok: true, errors: [] },
        integrity: { ok: true, errors: [] },
        overall_ok: true
    };

    validateMetadataIdentity(metadataRegistry, spec, report);
    validateMetadataAnchors(metadataRegistry, spec, report);
    validateMetadataCategory(metadataRegistry, spec, report);
    validateMetadataProperties(metadataRegistry, spec, report);
    validateMetadataCoordinates(metadataRegistry, skuRegistry, spec, report);
    validateMetadataSKU(metadataRegistry, skuRegistry, spec, report);
    validateMetadataIntegrity(metadataRegistry, spec, report);

    report.overall_ok = Object.values(report)
        .filter(s => typeof s === "object" && "ok" in s)
        .every(s => s.ok);

    return report;
}
