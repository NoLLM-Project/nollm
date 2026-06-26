// system/5_Function/coord_atomize_service.js

export function coord_atomize_service_room({ workflowContext, carrier }) {

    const hotelRoot = workflowContext["coord_hotel_root"];

    // REQUIRE: hotel_root must have run
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "atomize_service",
            error: "Hotel Root has not run yet",
            metadata_id: null,
            next_path: null,
            carrier
        };
    }

    const metadataId = hotelRoot.metadata_id;

    // ------------------------------------------------------------
    // VESTIBULE
    // ------------------------------------------------------------
    if (workflowContext.__from_front_desk === true) {
        return {
            phase: "atomize_service_vestibule",
            metadata_id: metadataId,
            next_path: "PATH_ATOMIZE",
            carrier
        };
    }

    // ------------------------------------------------------------
    // CHECKPOINT
    // ------------------------------------------------------------
    return {
        phase: "atomize_service_checkpoint",
        metadata_id: metadataId,
        next_path: "front_desk",
        carrier
    };
}
