// system/5_Function/coord_postprocess_service.js

export function coord_postprocess_service({ workflowContext, carrier }) {

    const hotelRoot = workflowContext["coord_hotel_root"];

    // REQUIRE: hotel_root must have run
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "postprocess_service",
            error: "Hotel Root has not run yet",
            metadata_id: null,
            next_path: null,
            carrier
        };
    }

    const metadataId = hotelRoot.metadata_id;

    // ------------------------------------------------------------
    // VESTIBULE + CHECKPOINT (NO WORK, NO NORMALIZATION)
    // ------------------------------------------------------------

    // If front_desk sent the runner here → VESTIBULE ENTRY
    if (workflowContext.__from_front_desk === true) {
        return {
            phase: "postprocess_service_vestibule",
            metadata_id: metadataId,
            next_path: "PATH_POSTPROCESS",
            carrier
        };
    }

    // If the runner reached this coord because PATH_POSTPROCESS ended → CHECKPOINT EXIT
    return {
        phase: "postprocess_service_checkpoint",
        metadata_id: metadataId,
        next_path: "coord_front_desk",
        carrier
    };
}
