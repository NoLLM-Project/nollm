// system/5_Function/coord_hotel_shell.js

import metadataRegistry from "../../3_Registry/Metadata/metadata_objects.json";

export function coord_hotel_shell({ workflowContext }) {

    const fieldResult = workflowContext["coord_field"];
    const adjacencyResult = workflowContext["coord_adjacency"];

    // ------------------------------------------------------------
    // REQUIREMENT: Field Pass 2 must have run
    // ------------------------------------------------------------
    if (!fieldResult || fieldResult.phase !== "field_pass_2") {
        return {
            phase: "hotel_shell",
            error: "Field Pass 2 has not run yet",
            metadata_id: null
        };
    }

    // We will strip these out:
    // canonical_name, object_id, canonical_id
    const canonicalName = fieldResult.canonical_name;

    // ------------------------------------------------------------
    // LOOK UP METADATA ENTRY BY CANONICAL NAME
    // ------------------------------------------------------------
    const entry = metadataRegistry.find(e => e.name === canonicalName);
    const metadataId = entry ? entry.id : null;

    // ------------------------------------------------------------
    // RETURN:
    //   - metadata_id
    //   - adjacency info
    //   - invariants
    //   - constraints
    //   - allowed parents/children
    //   - (NO canonical_name, NO object_id, NO canonical_id)
    // ------------------------------------------------------------
    return {
        phase: "hotel_shell",

        // NEW: metadata ID
        metadata_id: metadataId,

        // KEEP: adjacency + structural context
        allowed_parents: adjacencyResult?.allowed_parents || [],
        allowed_children: adjacencyResult?.allowed_children || [],
        constraints: adjacencyResult?.constraints || {},
        invariants: adjacencyResult?.invariants || []
    };
}
