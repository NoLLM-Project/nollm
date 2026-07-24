// system/5_Function/coord_front_desk.js

import { PATH_REVERSE } from "../1_Engine/paths.js";

export function coord_front_desk({ workflowContext, payload }) {

    console.log("FRONT DESK RAN");

    const hotelRoot = workflowContext["coord_hotel_root"];

    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "front_desk",
            error: "Hotel Root has not run yet",
            metadata_id: null,
            next_path: "coord_coat_room"
        };
    }

    const metadataId = hotelRoot.metadata_id;
    const atomizePosition = hotelRoot?.atomize_position || "before_runtime";

    const invReport = workflowContext["coord_invariants"]?.invariants_report || null;
    const hasInv = Boolean(invReport);
    const invPass = invReport?.pass || null;
    const invOK = invReport?.overall_ok;
    const severity = invReport?.severity;
    const routeBuilt = invReport?.route_built || false;
    const invDomain = invReport?.domain || null;

    const coatRoomDone = Boolean(workflowContext["coord_coat_room"]);
    const preprocessDone = Boolean(workflowContext["coord_preprocess_service"]);
    const atomizePhase = workflowContext["coord_atomize_service"]?.phase || null;
    const atomizeDone = atomizePhase === "atomize_service_checkpoint";
    const atomizeAlreadyTriggered = Boolean(atomizePhase);
    const runtimeRequestDone = Boolean(workflowContext["coord_runtime_request"]);
    const postprocessServiceDone = Boolean(workflowContext["coord_postprocess_service"]);

    // ------------------------------------------------------------
    // COAT ROOM MUST RUN FIRST
    // ------------------------------------------------------------
    if (!coatRoomDone) {
        return {
            phase: "front_desk",
            metadata_id: metadataId,
            next_path: "coord_coat_room"
        };
    }

    // ------------------------------------------------------------
    // PREPROCESS SERVICE
    // ------------------------------------------------------------
    if (!preprocessDone) {
        workflowContext.__from_front_desk = true;
        return {
            phase: "front_desk",
            metadata_id: metadataId,
            next_path: "coord_preprocess_service"
        };
    }

    // ------------------------------------------------------------
    // INVARIANTS AFTER PREPROCESS (PASS 1)
    // ------------------------------------------------------------
    if (!hasInv) {

        // ⭐ Reset invariants before starting a new domain check
        workflowContext["coord_invariants"] = null;
        workflowContext["coord_invariants_request"] = null;
        workflowContext["coord_invariants_pass_2"] = null;

        workflowContext["coord_invariants_request"] = {
            domain: "preprocess",
            pass: 1
        };

        return {
            phase: "front_desk_preprocess_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: { payload }
        };
    }

    if (severity === "hard") {
        return {
            phase: "front_desk",
            status: "invariants_failed",
            metadata_id: metadataId,
            reason: invReport.reason,
            next_path: "coord_tower"
        };
    }

    // ------------------------------------------------------------
    // PREPROCESS PASS 1 SOFT FAIL → ATOMIZE PASS 1 (NO ROUTE)
    // ------------------------------------------------------------
    if (
        invDomain === "preprocess" &&
        invPass === 1 &&
        invOK === false &&
        severity === "soft" &&
        routeBuilt === false &&
        !atomizeAlreadyTriggered
    ) {

        // ⭐ Reset invariants before switching to atomize
        workflowContext["coord_invariants"] = null;
        workflowContext["coord_invariants_request"] = null;
        workflowContext["coord_invariants_pass_2"] = null;

        workflowContext.__from_front_desk = true;

        workflowContext["coord_invariants_request"] = {
            domain: "atomize",
            pass: 1
        };

        return {
            phase: "front_desk_atomize_after_preprocess",
            metadata_id: metadataId,
            next_path: "coord_atomize_service",
            carrier: { payload }
        };
    }

    // ------------------------------------------------------------
    // PREPROCESS PASS 1 SUCCESS + ROUTE BUILT → PREPROCESS PASS 2
    // ------------------------------------------------------------
    if (
        invDomain === "preprocess" &&
        invPass === 1 &&
        invOK === true &&
        routeBuilt === true
    ) {

        // ⭐ Reset invariants before preprocess pass 2
        workflowContext["coord_invariants"] = null;
        workflowContext["coord_invariants_request"] = null;
        workflowContext["coord_invariants_pass_2"] = null;

        workflowContext["coord_invariants_request"] = {
            domain: "preprocess",
            pass: 2
        };

        return {
            phase: "front_desk_preprocess_route_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: { payload }
        };
    }

    // ------------------------------------------------------------
    // PREPROCESS PASS 2 SOFT FAIL → ATOMIZE PASS 1
    // ------------------------------------------------------------
    if (
        invDomain === "preprocess" &&
        invPass === 2 &&
        invOK === false &&
        severity === "soft" &&
        !atomizeAlreadyTriggered
    ) {

        // ⭐ Reset invariants before switching to atomize
        workflowContext["coord_invariants"] = null;
        workflowContext["coord_invariants_request"] = null;
        workflowContext["coord_invariants_pass_2"] = null;

        workflowContext.__from_front_desk = true;

        workflowContext["coord_invariants_request"] = {
            domain: "atomize",
            pass: 1
        };

        return {
            phase: "front_desk_atomize_after_preprocess_pass_2",
            metadata_id: metadataId,
            next_path: "coord_atomize_service",
            carrier: { payload }
        };
    }

    // ------------------------------------------------------------
    // ATOMIZE → INVARIANTS (PASS 1 OR 2)
    // ------------------------------------------------------------
    if (
        atomizeDone &&
        (invDomain === "preprocess" || invDomain === null)
    ) {
        const pass = invPass === 2 ? 2 : 1;

        // ⭐ Reset invariants before atomize invariants
        workflowContext["coord_invariants"] = null;
        workflowContext["coord_invariants_request"] = null;
        workflowContext["coord_invariants_pass_2"] = null;

        workflowContext["coord_invariants_request"] = {
            domain: "atomize",
            pass
        };

        return {
            phase: "front_desk_atomize_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: {
                payload: workflowContext["coord_atomize_service"]
            }
        };
    }

    // ------------------------------------------------------------
    // RUNTIME REQUEST (AFTER PREPROCESS PASS 2 OR ATOMIZE)
    // ------------------------------------------------------------
    if (!runtimeRequestDone && invDomain === "preprocess" && invPass === 2 && invOK === true) {
        return {
            phase: "front_desk_runtime_request",
            metadata_id: metadataId,
            next_path: "coord_runtime_request"
        };
    }

    // ------------------------------------------------------------
    // RUNTIME INVARIANTS (PASS 1 OR 2)
    // ------------------------------------------------------------
    if (runtimeRequestDone && invDomain !== "runtime") {

        const pass = invPass === 2 ? 2 : 1;

        // ⭐ Reset invariants before runtime invariants
        workflowContext["coord_invariants"] = null;
        workflowContext["coord_invariants_request"] = null;
        workflowContext["coord_invariants_pass_2"] = null;

        workflowContext["coord_invariants_request"] = {
            domain: "runtime",
            pass
        };

        return {
            phase: "front_desk_runtime_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: { payload }
        };
    }

    // ------------------------------------------------------------
    // ATOMIZE AFTER RUNTIME (POSITION = AFTER_RUNTIME)
    // ------------------------------------------------------------
    if (!severity && atomizePosition === "after_runtime" && runtimeRequestDone && !atomizeAlreadyTriggered) {

        workflowContext.__from_front_desk = true;

        // ⭐ Reset invariants before atomize pass 2
        workflowContext["coord_invariants"] = null;
        workflowContext["coord_invariants_request"] = null;
        workflowContext["coord_invariants_pass_2"] = null;

        workflowContext["coord_invariants_request"] = {
            domain: "atomize",
            pass: 2
        };

        return {
            phase: "front_desk_atomize_after_runtime",
            metadata_id: metadataId,
            next_path: "coord_atomize_service"
        };
    }

    // ------------------------------------------------------------
    // ATOMIZE → POSTPROCESS (NO DOMAIN CHECK)
    // ------------------------------------------------------------
    if (
        atomizeDone &&
        !postprocessServiceDone &&
        (
            (atomizePosition === "after_runtime" && runtimeRequestDone) ||
            (atomizePosition === "before_runtime" && !routeBuilt) ||
            (atomizePosition === "before_runtime" && runtimeRequestDone)
        )
    ) {
        workflowContext.__from_front_desk = true;

        return {
            phase: "front_desk_atomize_to_postprocess",
            metadata_id: metadataId,
            next_path: "coord_postprocess_service"
        };
    }

    // ------------------------------------------------------------
    // POSTPROCESS SERVICE (AFTER RUNTIME)
    // ------------------------------------------------------------
    if (runtimeRequestDone && !postprocessServiceDone) {
        workflowContext.__from_front_desk = true;

        return {
            phase: "front_desk_postruntime",
            metadata_id: metadataId,
            next_path: "coord_postprocess_service"
        };
    }

    // ------------------------------------------------------------
    // POSTPROCESS INVARIANTS (PASS 1 OR 2)
    // ------------------------------------------------------------
    if (postprocessServiceDone && invDomain !== "postprocess") {

        const pass = invPass === 2 ? 2 : 1;

        // ⭐ Reset invariants before postprocess invariants
        workflowContext["coord_invariants"] = null;
        workflowContext["coord_invariants_request"] = null;
        workflowContext["coord_invariants_pass_2"] = null;

        workflowContext["coord_invariants_request"] = {
            domain: "postprocess",
            pass
        };

        return {
            phase: "front_desk_post_invariants_request",
            metadata_id: metadataId,
            next_path: "coord_invariants_request",
            carrier: {
                payload: workflowContext["coord_postprocess_service"]?.payload
            }
        };
    }

    // ------------------------------------------------------------
    // FINAL PASS → REVERSE PATH
    // ------------------------------------------------------------
    if (invOK === true && invPass === 2) {
        return {
            phase: "front_desk_post_invariants_passed",
            metadata_id: metadataId,
            next_path: PATH_REVERSE
        };
    }

    // ------------------------------------------------------------
    // FALLBACK: UNDEFINED STATE
    // ------------------------------------------------------------
    return {
        phase: "front_desk",
        metadata_id: metadataId,
        error: "Front desk reached an undefined state",
        next_path: "coord_tower"
    };
}
