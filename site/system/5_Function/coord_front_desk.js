// system/5_Function/coord_front_desk.js

import { HOTEL_PATH_REVERSE, PATH_RUNTIME } from "../1_Engine/hotel_paths.js";

export function coord_front_desk({ workflowContext, carrier, userToken }) {

    // ------------------------------------------------------------
    // 1. REQUIRE: hotel_root must have run
    // ------------------------------------------------------------
    const hotelRoot = workflowContext["coord_hotel_root"];

    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "front_desk",
            error: "Hotel Root has not run yet",
            metadata_id: null,
            next_path: null
        };
    }

    const metadataId = hotelRoot.metadata_id;


    // ------------------------------------------------------------
    // 2. INVARIANTS REPORT HANDLING
    // ------------------------------------------------------------
    const invariantsRequest = workflowContext["coord_invariants_request"];

    if (invariantsRequest && invariantsRequest.invariants_report) {

        const report = invariantsRequest.invariants_report;

        if (report.overall_ok === true) {
            // PASS → fall through
        } else {
            const severity = report.severity;
            const domain = report.domain;

            if (severity === "hard") {
                return {
                    phase: "front_desk",
                    status: "invariants_failed",
                    metadata_id: metadataId,
                    reason: report.reason,
                    domain,
                    next_path: "tower"
                };
            }

            if (severity === "soft") {
                return {
                    phase: "front_desk",
                    status: "invariants_failed",
                    metadata_id: metadataId,
                    reason: report.reason,
                    domain,
                    next_path: "coat_room"
                };
            }

            return {
                phase: "front_desk",
                status: "invariants_failed",
                metadata_id: metadataId,
                reason: "Unknown invariants severity",
                domain,
                next_path: "tower"
            };
        }
    }


    // ------------------------------------------------------------
    // 3. READ PROGRESS FLAGS
    // ------------------------------------------------------------
    const coatRoomDone = Boolean(workflowContext["coord_coat_room"]);
    const preprocessDone = Boolean(workflowContext["coord_preprocess_service"]);
    const invariantsRequested = Boolean(workflowContext["coord_invariants_request"]);
    const runtimeRequestDone = Boolean(workflowContext["coord_runtime_request"]);
    const postprocessServiceDone = Boolean(workflowContext["coord_postprocess_service"]);


    // ------------------------------------------------------------
    // 4. PHASE A: PRE‑RUNTIME
    // ------------------------------------------------------------
    if (!coatRoomDone) {
        return {
            phase: "front_desk",
            metadata_id: metadataId,
            next_path: "coat_room"
        };
    }

    if (!preprocessDone) {
        return {
            phase: "front_desk",
            metadata_id: metadataId,
            next_path: "preprocess_service"
        };
    }

    if (!invariantsRequested) {
        return {
            phase: "front_desk",
            metadata_id: metadataId,
            next_path: "invariants_request"
        };
    }


    // ------------------------------------------------------------
    // 5. PHASE B: RUNTIME HANDOFF
    // ------------------------------------------------------------
    const report = invariantsRequest?.invariants_report;

    // ⭐ NEW: SKIP RUNTIME IF PATH_RUNTIME IS EMPTY
    if (PATH_RUNTIME.length === 0 && !runtimeRequestDone) {
        return {
            phase: "front_desk_skip_runtime",
            metadata_id: metadataId,
            next_path: "coord_postprocess_service"
        };
    }

    // Existing runtime handoff
    if (report && report.overall_ok === true && !runtimeRequestDone) {
        return {
            phase: "front_desk_runtime_request",
            metadata_id: metadataId,
            next_path: "coord_runtime_request"
        };
    }

    // NEW: request runtime invariants
    if (runtimeRequestDone && !workflowContext["coord_invariants_request_runtime"]) {
        return {
            phase: "front_desk_runtime_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request_runtime"
        };
    }

    // NEW: runtime invariants checkpoint
    const invRuntime = workflowContext["coord_invariants_request_runtime"];
    if (invRuntime?.invariants_report?.overall_ok === true && !postprocessServiceDone) {
        return {
            phase: "front_desk_runtime_invariants_passed",
            metadata_id: metadataId,
            next_path: "coord_postprocess_service"
        };
    }


    // ------------------------------------------------------------
    // 6. PHASE C: POST‑RUNTIME
    // ------------------------------------------------------------
    if (runtimeRequestDone && !postprocessServiceDone) {
        return {
            phase: "front_desk_postruntime",
            metadata_id: metadataId,
            next_path: "coord_postprocess_service"
        };
    }

    // NEW: request postprocess invariants
    if (postprocessServiceDone && !workflowContext["coord_invariants_request_post"]) {
        return {
            phase: "front_desk_post_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request_post"
        };
    }

    // NEW: postprocess invariants checkpoint
    const invPost = workflowContext["coord_invariants_request_post"];
    if (invPost?.invariants_report?.overall_ok === true) {
        const firstReturnPath = HOTEL_PATH_REVERSE[0];
        return {
            phase: "front_desk_post_invariants_passed",
            metadata_id: metadataId,
            next_path: firstReturnPath
        };
    }


    // ------------------------------------------------------------
    // 8. FALLBACK
    // ------------------------------------------------------------
    return {
        phase: "front_desk",
        metadata_id: metadataId,
        error: "Front desk reached an undefined state",
        next_path: null
    };
}
