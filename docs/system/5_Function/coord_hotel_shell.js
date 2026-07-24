// system/5_Function/coord_hotel_shell.js

import { loadJson } from "../utils/load_json.js";

export async function coord_hotel_shell({ workflowContext }) {

    console.log("HOTEL SHELL RAN");
 
    const metadataRegistry = await loadJson("../3_Registry/Metadata/metadata_objects.json");

    const fieldResult = workflowContext["coord_field"];
    const adjacencyResult = workflowContext["coord_adjacency"];

    // ------------------------------------------------------------
    // REQUIREMENT: Field Pass 2 must have run
    // ------------------------------------------------------------
    if (!fieldResult || fieldResult.phase !== "field_pass_2") {
        return {
            phase: "hotel_shell",
            warning: "Field Pass 2 has not run yet",
            metadata_id: null
        };
    }

    const canonicalName = fieldResult.canonical_name;

    // ------------------------------------------------------------
    // LOOK UP METADATA ENTRY BY CANONICAL NAME
    // ------------------------------------------------------------
    const entry = metadataRegistry.find(e => e.name === canonicalName);
    const metadataId = entry ? entry.id : null;

    // ------------------------------------------------------------
    // NON-BLOCKING RETURN
    // ------------------------------------------------------------
    return {
        phase: "hotel_shell",

        // metadata may be null — this is OK
        metadata_id: metadataId,
        metadata: entry || null,

        // adjacency + structural context always returned
        allowed_parents: adjacencyResult?.allowed_parents || [],
        allowed_children: adjacencyResult?.allowed_children || [],
        constraints: adjacencyResult?.constraints || {},
        invariants: adjacencyResult?.invariants || []
    };
}
