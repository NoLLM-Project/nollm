// system/5_Function/coord_postprocess_service.js
// Corrected handshake version — stable, deterministic, invariant‑ready

export function coord_postprocess_service({ workflowContext, carrier }) {

    console.log("POSTPROCESS SERVICE RAN");
    console.log("POSTPROCESS: __from_front_desk =", workflowContext.__from_front_desk);
    console.log("POSTPROCESS: carrier =", carrier);

    const hotelRoot = workflowContext["coord_hotel_root"];

    // REQUIRE: hotel_root must have run
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        console.log("POSTPROCESS: Hotel root missing or invalid");
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
    // VESTIBULE ENTRY → PATH_POSTPROCESS
    // ------------------------------------------------------------
    if (workflowContext.__from_front_desk === true) {
        console.log("POSTPROCESS: Entering VESTIBULE");
        return {
            phase: "postprocess_service_vestibule",
            metadata_id: metadataId,
            next_path: "PATH_POSTPROCESS",
            carrier
        };
    }

    // ------------------------------------------------------------
    // CHECKPOINT EXIT — write payload into workflowContext
    // ------------------------------------------------------------
    console.log("POSTPROCESS: Entering CHECKPOINT EXIT");

    // ⭐ Correct handshake: invariants expect payload.postprocess_output
    workflowContext["coord_postprocess_service"] = {
        phase: "postprocess_service_checkpoint",
        metadata_id: metadataId,
        payload: {
            // This is the actual output produced by PATH_POSTPROCESS rooms
            postprocess_output: carrier?.payload?.output ?? null
        }
    };

    return {
        phase: "postprocess_service_checkpoint",
        metadata_id: metadataId,
        next_path: "coord_front_desk",
        carrier
    };
}
