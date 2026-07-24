// system/5_Function/coord_runtime_request.js

export function coord_runtime_request({ workflowContext, carrier }) {

    // ------------------------------------------------------------
    // 1. REQUIRE: invariants must have passed earlier
    // ------------------------------------------------------------
    const frontDesk = workflowContext["coord_front_desk"];
    const report = frontDesk?.invariants_report;

    if (!report || report.overall_ok !== true) {
        return {
            phase: "runtime_request",
            error: "Runtime cannot proceed without a valid invariants report",
            next_path: null
        };
    }

    // ------------------------------------------------------------
    // 2. REQUIRE: runtime path must exist
    // ------------------------------------------------------------
    const path = carrier?.payload?.path;

    if (!Array.isArray(path)) {
        return {
            phase: "runtime_request",
            error: "No runtime path available",
            next_path: null
        };
    }

    // ------------------------------------------------------------
    // 3. IF PATH IS EMPTY → RUNTIME COMPLETE → RETURN TO FRONT DESK
    // ------------------------------------------------------------
    if (path.length === 0) {
        return {
            phase: "runtime_complete",
            next_path: "coord_front_desk"
        };
    }

    // ------------------------------------------------------------
    // 4. POP THE NEXT COORD_* ID
    // ------------------------------------------------------------
    const [nextCoord, ...remaining] = path;

    // Update the carrier with the remaining path
    carrier.payload.path = remaining;

    // ------------------------------------------------------------
    // 5. DISPATCH TO THE NEXT RUNTIME COORDINATE
    // ------------------------------------------------------------
    return {
        phase: "runtime_request",
        next_runtime_coord: nextCoord,  // already a coord_* ID
        next_path: nextCoord            // runner can execute directly
    };
}
