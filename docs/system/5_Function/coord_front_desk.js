// system/5_Function/coord_front_desk.js

import { PATH_REVERSE } from "../1_Engine/paths.js";

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

    // NEW: atomize ordering
    const atomizePosition = hotelRoot?.atomize_position || "before_runtime";


    // ------------------------------------------------------------
    // 2. INVARIANTS REPORT HANDLING (same invariants_request, multiple passes)
    // ------------------------------------------------------------
    const invariantsRequest = workflowContext["coord_invariants_request"];

    if (invariantsRequest && invariantsRequest.invariants_report) {

        const report = invariantsRequest.invariants_report;

        if (report.overall_ok === true) {
            // PASS → fall through to next phase decision
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
                    next_path: "coord_tower"
                };
            }

            if (severity === "soft") {
                return {
                    phase: "front_desk",
                    status: "invariants_failed",
                    metadata_id: metadataId,
                    reason: report.reason,
                    domain,
                    next_path: "coord_coat_room"
                };
            }

            return {
                phase: "front_desk",
                status: "invariants_failed",
                metadata_id: metadataId,
                reason: "Unknown invariants severity",
                domain,
                next_path: "coord_tower"
            };
        }
    }


    // ------------------------------------------------------------
    // 3. READ PROGRESS FLAGS
    // ------------------------------------------------------------
    const coatRoomDone = Boolean(workflowContext["coord_coat_room"]);
    const preprocessDone = Boolean(workflowContext["coord_preprocess_service"]);
    const atomizeDone = Boolean(workflowContext["coord_atomize_service"]);
    const runtimeRequestDone = Boolean(workflowContext["coord_runtime_request"]);
    const postprocessServiceDone = Boolean(workflowContext["coord_postprocess_service"]);

    const lastInvReport = invariantsRequest?.invariants_report;
    const lastInvDomain = lastInvReport?.domain;


    // ------------------------------------------------------------
    // 4. PHASE A: PRE‑RUNTIME
    // ------------------------------------------------------------
    if (!coatRoomDone) {
        return {
            phase: "front_desk",
            metadata_id: metadataId,
            next_path: "coord_coat_room"
        };
    }

    if (!preprocessDone) {
        return {
            phase: "front_desk",
            metadata_id: metadataId,
            next_path: "coord_preprocess_service"
        };
    }

    // PREPROCESS INVARIANTS
    if (!lastInvReport) {
        return {
            phase: "front_desk_preprocess_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: {
                payload: carrier?.payload,
                domain: "preprocess"
            }
        };
    }


    // ------------------------------------------------------------
    // ATOMIZE BEFORE RUNTIME
    // ------------------------------------------------------------
    if (atomizePosition === "before_runtime") {

        if (!atomizeDone) {
            return {
                phase: "front_desk_atomize",
                metadata_id: metadataId,
                next_path: "coord_atomize_service"
            };
        }

        if (atomizeDone && lastInvDomain !== "atomize") {
            return {
                phase: "front_desk_atomize_invariants_request",
                metadata_id: metadataId,
                next_path: "coord_invariants_request",
                carrier: {
                    payload: carrier?.payload,
                    domain: "atomize"
                }
            };
        }
    }


    // ------------------------------------------------------------
    // ROUTE INVARIANTS (pass 1 + pass 2 handled inside invariants_request)
    // ------------------------------------------------------------
    if (lastInvDomain !== "route") {
        return {
            phase: "front_desk_route_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: {
                payload: carrier?.payload,
                domain: "route"
            }
        };
    }


    // ------------------------------------------------------------
    // 5. PHASE B: RUNTIME HANDOFF
    // ------------------------------------------------------------
    if (lastInvDomain === "route" && lastInvReport?.overall_ok === true && !runtimeRequestDone) {
        return {
            phase: "front_desk_runtime_request",
            metadata_id: metadataId,
            next_path: "coord_runtime_request"
        };
    }

    // RUNTIME INVARIANTS
    if (runtimeRequestDone && lastInvDomain !== "runtime") {
        return {
            phase: "front_desk_runtime_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: {
                payload: carrier?.payload,
                domain: "runtime"
            }
        };
    }


    // ------------------------------------------------------------
    // ATOMIZE AFTER RUNTIME
    // ------------------------------------------------------------
    if (atomizePosition === "after_runtime") {

        if (runtimeRequestDone && !atomizeDone) {
            return {
                phase: "front_desk_atomize_after_runtime",
                metadata_id: metadataId,
                next_path: "coord_atomize_service"
            };
        }

        if (runtimeRequestDone && atomizeDone && lastInvDomain !== "atomize") {
            return {
                phase: "front_desk_atomize_invariants_request_after_runtime",
                metadata_id: metadataId,
                next_path: "coord_invariants_request",
                carrier: {
                    payload: carrier?.payload,
                    domain: "atomize"
                }
            };
        }
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

    // POSTPROCESS INVARIANTS
    if (postprocessServiceDone && lastInvDomain !== "postprocess") {
        return {
            phase: "front_desk_post_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: {
                payload: carrier?.payload,
                domain: "postprocess"
            }
        };
    }

    // FINAL CHECKPOINT (⭐ FIXED)
    if (lastInvDomain === "postprocess" && lastInvReport?.overall_ok === true) {
        return {
            phase: "front_desk_post_invariants_passed",
            metadata_id: metadataId,
            next_path: "PATH_REVERSE"
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
