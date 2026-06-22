// system/5_Function/coord_hotel_root.js

import metadataRegistry from "../../3_Registry/Metadata/metadata_objects.json";

export function coord_hotel_root({ workflowContext }) {

    const shell = workflowContext["coord_hotel_shell"];

    // ------------------------------------------------------------
    // REQUIREMENT: Hotel Shell must have run
    // ------------------------------------------------------------
    if (!shell || shell.phase !== "hotel_shell") {
        return {
            phase: "hotel_root",
            error: "Hotel Shell has not run yet",
            metadata_id: null
        };
    }

    const metadataId = shell.metadata_id;

    // ------------------------------------------------------------
    // LOOK UP FULL METADATA OBJECT
    // ------------------------------------------------------------
    const entry = metadataRegistry.find(e => e.id === metadataId);

    if (!entry) {
        return {
            phase: "hotel_root",
            metadata_id: metadataId,
            metadata: null,

            // pass through structural context
            allowed_parents: shell.allowed_parents,
            allowed_children: shell.allowed_children,
            constraints: shell.constraints,
            invariants: shell.invariants
        };
    }

    // ------------------------------------------------------------
    // RETURN:
    //   - metadata_id
    //   - full metadata object (minus naming/placement IDs)
    //   - structural context from shell
    // ------------------------------------------------------------
    return {
        phase: "hotel_root",

        metadata_id: metadataId,

        metadata: {
            name: entry.name,
            sku: entry.sku,
            coordinates: entry.coordinates,
            type: entry.type,
            category: entry.category,
            anchors: entry.anchors || {},
            properties: entry.properties || {}
        },

        // structural context preserved
        allowed_parents: shell.allowed_parents,
        allowed_children: shell.allowed_children,
        constraints: shell.constraints,
        invariants: shell.invariants
    };
}
