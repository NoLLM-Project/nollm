// system/5_Function/coord_adjacency.js

import { loadJson } from "../utils/load_json.js";

export async function coord_adjacency({ xyz, workflowContext }) {

    console.log("ADJACENCY RAN");

    // ------------------------------------------------------------
    // REQUIREMENT: Field Pass 2 must have run
    // ------------------------------------------------------------
    const fieldResult = workflowContext["coord_field"];

    if (!fieldResult || fieldResult.phase !== "field_pass_2") {
        return {
            phase: "adjacency",
            error: "Field Pass 2 has not run yet",
            object_id: null,
            allowed_parents: [],
            allowed_children: [],
            constraints: {},
            invariants: []
        };
    }

    const objectId = fieldResult.object_id;

    // ------------------------------------------------------------
    // LOAD ALL PLACEMENT REGISTRIES
    // ------------------------------------------------------------

    async function safeLoad(path) {
        try {
            return await loadJson(path);
        } catch (err) {
            if (err.code === "ENOENT") return [];   // Missing file → empty array
            throw err;                               // Real error → crash
        }
    }

    const worldPlacement = await loadJson("../3_Registry/Placement/world_placement.json");
    const hotelPlacement = await loadJson("../3_Registry/Placement/hotel_placement.json");

    const floor01Placement = await loadJson("../3_Registry/Placement/floor_01_placement.json");
    const floor02Placement = await loadJson("../3_Registry/Placement/floor_02_placement.json");
    const floor03Placement = await loadJson("../3_Registry/Placement/floor_03_placement.json");

    const servicePlacement = await loadJson("../3_Registry/Placement/service_placement.json");

    // ------------------------------------------------------------
    // MERGE ALL PLACEMENT REGISTRIES
    // ------------------------------------------------------------
    const allPlacement = [
        ...worldPlacement,
        ...hotelPlacement,
        ...floor01Placement,
        ...floor02Placement,
        ...floor03Placement,
        ...servicePlacement,

    ];

    // ------------------------------------------------------------
    // FIND THE PLACEMENT ENTRY FOR THIS OBJECT
    // ------------------------------------------------------------
    const entry = allPlacement.find(e => e.object_id === objectId);

    if (!entry) {
        return {
            phase: "adjacency",
            object_id: objectId,
            allowed_parents: [],
            allowed_children: [],
            constraints: {},
            invariants: []
        };
    }

    // ------------------------------------------------------------
    // RETURN STRUCTURAL METADATA
    // ------------------------------------------------------------
    return {
        phase: "adjacency",
        object_id: entry.object_id,
        allowed_parents: entry.allowed_parents || [],
        allowed_children: entry.allowed_children || [],
        constraints: entry.constraints || {},
        invariants: entry.invariants || []
    };
}
