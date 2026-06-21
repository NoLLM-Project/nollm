// system/5_Function/coord_tower.js

import { loadJson } from "../../utils/load_json.js";

export async function coord_tower({ payload, userTag, xyz, workflowContext }) {

    // Load alias registry (browser-safe)
    const aliasRegistry = await loadJson("../../3_Registry/Naming/aliases.json");

    // -----------------------------
    // PASS 1: ALIAS EXTRACTION
    // -----------------------------
    if (!workflowContext["coord_field"]) {
        const rawText = payload?.rawText || "";

        const aliases = extractAliases(rawText, aliasRegistry);

        return {
            phase: "tower_pass_1",
            aliases
        };
    }

    // -----------------------------
    // PASS 2: SEMANTIC CONFIRMATION
    // -----------------------------
    const fieldResult = workflowContext["coord_field"];

    return {
        phase: "tower_pass_2",
        canonical_name: fieldResult.canonical_name,
        type: fieldResult.type,
        layer: fieldResult.layer,
        description: fieldResult.description
    };
}


// ------------------------------------------------------------
// Helper: Extract aliases from raw text using alias registry
// ------------------------------------------------------------
function extractAliases(rawText, registry) {
    const matches = [];

    for (const alias in registry) {
        if (rawText.includes(alias)) {
            matches.push({
                alias,
                canonical: registry[alias]
            });
        }
    }

    return matches;
}
