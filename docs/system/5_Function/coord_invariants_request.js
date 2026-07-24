// system/5_Function/coord_invariants_request.js

export function coord_invariants_request({ workflowContext, carrier }) {
    console.log("INVARIANTS REQUEST RAN");

    const hotelRoot = workflowContext["coord_hotel_root"];
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "invariants_request_error",
            metadata_id: null,
            invariants_report: null,
            domain: null,
            pass: null,
            next_path: "coord_tower",
            carrier
        };
    }

    const metadataId = hotelRoot.metadata_id;

    // The ONLY source of truth for domain + pass
    const req = workflowContext["coord_invariants_request"] || null;
    const domain = req?.domain || null;
    const pass = req?.pass || null;

    const lastInv = workflowContext["coord_invariants"] || null;
    const lastReport = lastInv?.invariants_report || null;

    console.log("INVARIANTS REQUEST RECEIVED (LAST INV):", lastInv);

    // ------------------------------------------------------------
    // If front_desk did NOT set a new invariants_request,
    // do NOT call coord_invariants again. Hard-stop to tower.
    // ------------------------------------------------------------
    if (!domain || !pass) {
        return {
            phase: "invariants_request_idle",
            metadata_id: metadataId,
            invariants_report: lastReport,
            domain: null,
            pass: null,
            next_path: "coord_tower",
            carrier
        };
    }

    // ------------------------------------------------------------
    // ALWAYS honor front_desk request
    // ------------------------------------------------------------
    return {
        phase: pass === 1 ? "invariants_request_initial" : "invariants_request_pass_2",
        metadata_id: metadataId,
        invariants_report: lastReport,
        domain,
        pass,
        next_path: "coord_invariants",
        carrier
    };
}
