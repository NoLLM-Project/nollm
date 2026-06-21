// system/5_Function/validators/run_all_sku_invariants.js

import { loadSKUInvariants } from "./load_sku_invariants.js";
import { validateSKUIdentity } from "./validate_sku_identity.js";
import { validateSKUObjectMapping } from "./validate_sku_object_mapping.js";
import { validateSKUCategory } from "./validate_sku_category.js";
import { validateSKUCoordinates } from "./validate_sku_coordinates.js";
import { validateSKUMetadata } from "./validate_sku_metadata.js";
import { validateSKUVersioning } from "./validate_sku_versioning.js";
import { validateSKUIntegrity } from "./validate_sku_integrity.js";

export function runAllSKUInvariants(skuRegistry, coordinateRegistry, metadataRegistry) {

    const spec = loadSKUInvariants();

    const report = {
        identity: { ok: true, errors: [] },
        object_mapping: { ok: true, errors: [] },
        category: { ok: true, errors: [] },
        coordinates: { ok: true, errors: [] },
        metadata: { ok: true, errors: [] },
        versioning: { ok: true, errors: [] },
        integrity: { ok: true, errors: [] },
        overall_ok: true
    };

    validateSKUIdentity(skuRegistry, spec, report);
    validateSKUObjectMapping(skuRegistry, coordinateRegistry, metadataRegistry, spec, report);
    validateSKUCategory(skuRegistry, spec, report);
    validateSKUCoordinates(skuRegistry, coordinateRegistry, spec, report);
    validateSKUMetadata(skuRegistry, metadataRegistry, spec, report);
    validateSKUVersioning(skuRegistry, spec, report);
    validateSKUIntegrity(skuRegistry, coordinateRegistry, metadataRegistry, spec, report);

    report.overall_ok = Object.values(report)
        .filter(s => typeof s === "object" && "ok" in s)
        .every(s => s.ok);

    return report;
}
