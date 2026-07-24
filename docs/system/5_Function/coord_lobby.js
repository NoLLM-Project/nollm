// system/5_Function/coord_lobby.js

export function coord_lobby({ workflowContext }) {

    console.log("LOBBY RAN");

    const hotelRoot = workflowContext["coord_hotel_root"];

    // Hotel Root has not run yet — flag but do NOT block
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "lobby",
            warning: "Hotel Root has not run yet",
            next_path: "front_desk",

            metadata_id: hotelRoot?.metadata_id || null,
            metadata: hotelRoot?.metadata || null,

            allowed_parents: hotelRoot?.allowed_parents || [],
            allowed_children: hotelRoot?.allowed_children || [],
            constraints: hotelRoot?.constraints || {},
            invariants: hotelRoot?.invariants || []
        };
    }

    // Always route to front desk
    return {
        phase: "lobby",
        next_path: "front_desk",

        metadata_id: hotelRoot.metadata_id,
        metadata: hotelRoot.metadata,

        allowed_parents: hotelRoot.allowed_parents,
        allowed_children: hotelRoot.allowed_children,
        constraints: hotelRoot.constraints,
        invariants: hotelRoot.invariants
    };
}
