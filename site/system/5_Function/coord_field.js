// system/5_Function/coord_field.js

import canonicalRegistry from "../../3_Registry/Naming/canonical_names.json";

export function coord_field({ payload, xyz, workflowContext }) {

    // ------------------------------------------------------------
    // PASS 1: SEMANTIC CLEANING
    // ------------------------------------------------------------
    // Tower has run once, so workflowContext["coord_tower"] exists.
    // Field receives aliases and returns:
    //   canonical_name
    //   type
    //   layer
    //   description
    //
    // Field does NOT return object_id or canonical_id yet.
    // ------------------------------------------------------------
    if (!workflowContext["coord_tower"]?.phase ||
        workflowContext["coord_tower"].phase === "tower_pass_1") {

        const aliases = workflowContext["coord_tower"]?.aliases || [];

        // Find the first matching canonical entry
        const match = resolveCanonical(aliases, canonicalRegistry);

        if (!match) {
            return {
                phase: "field_pass_1",
                canonical_name: null,
                type: null,
                layer: null,
                description: null
            };
        }

        return {
            phase: "field_pass_1",
            canonical_name: match.canonical_name,
            type: match.type,
            layer: match.layer,
            description: match.description
        };
    }


    // ------------------------------------------------------------
    // PASS 2: ID RESOLUTION
    // ------------------------------------------------------------
    // Tower has run twice, so workflowContext["coord_tower"].phase === "tower_pass_2".
    // Field receives canonical_name and returns:
    //   object_id
    //   canonical_id
    //   canonical_name
    //
    // Field does NOT interpret meaning.
    // Field does NOT return type/layer/description again.
    // ------------------------------------------------------------
    const towerResult = workflowContext["coord_tower"];

    const canonicalName = towerResult.canonical_name;
    const entry = canonicalRegistry.find(e => e.canonical_name === canonicalName);

    if (!entry) {
        return {
            phase: "field_pass_2",
            canonical_name: canonicalName,
            object_id: null,
            canonical_id: null
        };
    }

    return {
        phase: "field_pass_2",
        canonical_name: entry.canonical_name,
        object_id: entry.id,
        canonical_id: entry.id // same as id in your schema
    };
}


// ------------------------------------------------------------
// Helper: resolve canonical entry from alias list
// ------------------------------------------------------------
function resolveCanonical(aliases, registry) {
    for (const { canonical } of aliases) {
        const entry = registry.find(e => e.canonical_name === canonical);
        if (entry) return entry;
    }
    return null;
}
