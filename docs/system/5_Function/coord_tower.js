// system/5_Function/coord_tower.js

import { loadJson } from "../utils/load_json.js";

export async function coord_tower({ payload, userTag, xyz, workflowContext }) {

    console.log("TOWER RAN", {payload, userTag });

    let aliasRegistry = {};

    try {
        console.log("CURRENT WORKING DIRECTORY:", process.cwd());
        console.log("ATTMEPTING TO LOAD:", "../3_Registry/Naming/aliases.json");

        aliasRegistry = await loadJson("../3_Registry/Naming/aliases.json");

        console.log("ALIAS REGISTRY RAW:", aliasRegistry);

        // (You already have this one)
        console.log("LOADED ALIAS REGISTRY:", aliasRegistry);

    } catch (err) {
        if (err.code === "ENOENT") {
            aliasRegistry = {};   // Missing file → empty registry
        } else {
            throw err;            // Real error → crash
        }
    }

    // -----------------------------
    // PASS 1: ALIAS EXTRACTION
    // -----------------------------
    if (!workflowContext["coord_field"]) {
        const rawText = payload?.rawText || "";

        const aliases = extractAliases(rawText, aliasRegistry);

        console.log("TOWER PASS 1 ALIASES:", aliases);

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

    console.log("RAW TEXT FOR ALIAS SCAN:", rawText);
    console.log("ALIAS REGISTRY KEYS:", Object.keys(registry));

    const matches = [];

    for (const alias in registry) {
        console.log("CHECKING ALIAS:", alias, "→ includes?", rawText.includes(alias));

        if (rawText.includes(alias)) {
            matches.push({
                alias,
                canonical: registry[alias]
            });
        }
    }

    return matches;
}
