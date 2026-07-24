// system/5_Function/coord_atomize_service.js
// Corrected handshake version — stable, deterministic, invariant‑ready

export function coord_atomize_service({ workflowContext, carrier }) {

    console.log("ATOMIZE SERVICE RAN");
    console.log("  FROM FRONT DESK FLAG:", workflowContext.__from_front_desk);
    console.log("  PRIOR ATOMIZE SERVICE:", workflowContext["coord_atomize_service"]);

    const hotelRoot = workflowContext["coord_hotel_root"];

    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        console.log("  HOTEL ROOT CHECK FAILED");
        return {
            phase: "atomize_service",
            error: "Hotel Root has not run yet",
            metadata_id: null,
            next_path: null
        };
    }

    const metadataId = hotelRoot.metadata_id;

    // ------------------------------------------------------------
    // 1. FIRST CALL FROM FRONT DESK → VESTIBULE → PATH_ATOMIZE
    // ------------------------------------------------------------
    if (workflowContext.__from_front_desk === true) {
        console.log("  VESTIBULE BRANCH FIRED");

        return {
            phase: "atomize_service_vestibule",
            metadata_id: metadataId,
            next_path: "PATH_ATOMIZE",
            __log: "coord_atomize_service_vestibule"
        };
    }

    // ------------------------------------------------------------
    // 2. SECOND CALL FROM PATH_ATOMIZE → CHECKPOINT → FRONT DESK
    // ------------------------------------------------------------
    console.log("  CHECKPOINT BRANCH FIRED");
    console.log("ATOMIZE SERVICE: NEW VERSION ACTIVE");


    // ⭐ Correct handshake: pull atomize outputs from workflowContext rooms
    const tokens   = workflowContext["coord_tokenize_for_atoms"]?.payload?.result;
    const atoms    = workflowContext["coord_resolve_atoms"]?.payload?.atoms;
    const chunks   = workflowContext["coord_match_chunks"]?.payload?.chunks;
    const clauses  = workflowContext["coord_segment_clauses"]?.payload?.clauses;
    const sentence = workflowContext["coord_assemble_sentence"]?.payload?.sentence;

    workflowContext["coord_atomize_service"] = {
        phase: "atomize_service_checkpoint",
        metadata_id: metadataId,

        // ⭐ These are the fields invariants expect
        tokens,
        atoms,
        chunks,
        clauses,
        sentence,

        log: "coord_atomize_service_checkpoint_fired"
    };

    return {
        phase: "atomize_service_checkpoint",
        metadata_id: metadataId,
        next_path: "front_desk",
        log: "coord_atomize_service_checkpoint_fired"
    };
}
