// system/5_Function/coord_invariants_request.js

export function coord_invariants_request({ workflowContext, carrier }) {

    const hotelRoot = workflowContext["coord_hotel_root"];

    // REQUIRE: hotel_root must have run
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "invariants_request",
            error: "Hotel Root has not run yet",
            invariants_report: null,
            next_path: null
        };
    }

    const hasPath = Boolean(carrier?.payload?.path);
    const hasReport = Boolean(carrier?.invariants_report);

    // ------------------------------------------------------------
    // PASS 1: no path, no report → vestibule → send to coord_invariants (pass 1)
    // ------------------------------------------------------------
    if (!hasPath && !hasReport) {
        return {
            phase: "invariants_request_pass_1",
            invariants_report: null,
            next_path: "coord_invariants"
        };
    }

    // ------------------------------------------------------------
    // CHECKPOINT AFTER PASS 1: path built, report from pass 1 present
    // → hand report to front_desk, which will decide to run pass 2
    // ------------------------------------------------------------
    if (hasPath && hasReport && carrier.invariants_report.phase === "invariants_pass_1") {
        return {
            phase: "invariants_request_pass_1_checkpoint",
            invariants_report: carrier.invariants_report,
            next_path: "front_desk"
        };
    }

    // ------------------------------------------------------------
    // PASS 2: path present, but no pass 2 report yet → send to coord_invariants (pass 2)
    // ------------------------------------------------------------
    if (hasPath && !hasReport) {
        return {
            phase: "invariants_request_pass_2",
            invariants_report: null,
            next_path: "coord_invariants"
        };
    }

    // ------------------------------------------------------------
    // CHECKPOINT AFTER PASS 2: full invariants report → hand to front_desk
    // ------------------------------------------------------------
    if (hasPath && hasReport && carrier.invariants_report.phase === "invariants_pass_2") {
        return {
            phase: "invariants_request_pass_2_checkpoint",
            invariants_report: carrier.invariants_report,
            next_path: "front_desk"
        };
    }

    // Fallback: undefined state
    return {
        phase: "invariants_request",
        invariants_report: null,
        next_path: null,
        error: "Invariants request reached an undefined state"
    };
}
