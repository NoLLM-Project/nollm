// system/5_Function/validators/load_sku_registry.js

import { loadJson } from "../../utils/load_json.js";

export async function loadSKURegistry() {
    // Load raw SKU array
    const raw = await loadJson("system/3_Registry/SKUs/sku_namespace.json");

    // Build registry object
    const registry = {};

    for (const entry of raw) {
        registry[entry.sku] = {
            id: entry.sku,
            object_id: entry.object_id,
            coordinate_id: entry.coordinates,
            metadata_id: entry.metadata,
            category: entry.category,
            version: entry.version
        };
    }

    return registry;
}
