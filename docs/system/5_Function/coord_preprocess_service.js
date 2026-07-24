// system/5_Function/coord_preprocess_service.js

export function coord_preprocess_service({ workflowContext, carrier }) {

    console.log("PREPROCESS SERVICE RAN");

    const hotelRoot = workflowContext["coord_hotel_root"];

    // REQUIRE: hotel_root must have run
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "preprocess_service",
            error: "Hotel Root has not run yet",
            log: "entered",
            metadata_id: null,
            next_path: null
        };
    }

    const metadataId = hotelRoot.metadata_id;

    // ------------------------------------------------------------
    // VESTIBULE (NO SUPERVISION, NO DETECTION)
    // ------------------------------------------------------------
    if (workflowContext.__from_front_desk === true) {
        return {
            phase: "preprocess_service_vestibule",
            metadata_id: metadataId,
            next_path: "PATH_PREPROCESS",
            __log: "coord_preprocess_service"
        };
    }

    // ------------------------------------------------------------
    // CHECKPOINT (PATH_PREPROCESS ended here)
    // ------------------------------------------------------------
    return {
        phase: "preprocess_service_checkpoint",
        metadata_id: metadataId,
        next_path: "coord_front_desk",
        log: "entered"
    };
}
