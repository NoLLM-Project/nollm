// system/5_Function/coord_field.js

import { loadJson } from "../utils/load_json.js";

export async function coord_field({ payload, xyz, workflowContext }) {

    console.log("FIELD RAN", { payload });

    let canonicalNames = [];

    try {
        canonicalNames = await loadJson("../3_Registry/Naming/canonical_names.json");
    } catch (err) {
        if (err.code === "ENOENT") {
            canonicalNames = [];   // Missing file → empty registry
        } else {
            throw err;
        }
    }

    // PASS 1
    if (!workflowContext["coord_tower"]?.phase ||
        workflowContext["coord_tower"].phase === "tower_pass_1") {

        const aliases = workflowContext["coord_tower"]?.aliases || [];

        console.log("FIELD PASS 1 RECEIVED ALIASES:", aliases);

        const match = resolveCanonical(aliases, canonicalNames);

        console.log("FIELD PASS 1 CANONICAL MATCH:", match);

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

    // PASS 2
    const towerResult = workflowContext["coord_tower"];
    const canonicalName = towerResult.canonical_name;

    // array search instead of dictionary lookup
    const entry = canonicalNames.find(e =>
        e.id === canonicalName ||
        e.canonical_name === canonicalName
    );

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
        canonical_id: entry.id
    };
}

// Helper: array search instead of registry[canonical]
function resolveCanonical(aliases, registry) {
    for (const { canonical } of aliases) {
        const entry = registry.find(e =>
            e.id === canonical ||
            e.canonical_name === canonical
        );
        if (entry) return entry;
    }
    return null;
}
