// system/5_Function/path_selector.js

export function selectNextPath({ workflowContext }) {

    // ------------------------------------------------------------
    // 1. Handle inbound invariants report (if present)
    // ------------------------------------------------------------
    const invariantsRequest = workflowContext["coord_invariants_request"];

    if (invariantsRequest && invariantsRequest.invariants_report) {

        const report = invariantsRequest.invariants_report;

        // PASS → continue normal sequencing
        if (report.overall_ok === true) {
            // fall through to normal path selection
        } else {
            // FAIL → choose return path based on severity
            if (report.severity === "hard") {
                return "tower";
            }
            if (report.severity === "soft") {
                return "coat_room";
            }

            // fallback
            return "tower";
        }
    }

    // ------------------------------------------------------------
    // 2. Normal sequencing (coat_room → preprocess → invariants_request)
    // ------------------------------------------------------------
    const coatRoomDone = Boolean(workflowContext["coord_coat_room"]);
    const preprocessDone = Boolean(workflowContext["coord_preprocess_service_room"]);
    const invariantsRequested = Boolean(workflowContext["coord_invariants_request"]);

    if (!coatRoomDone) {
        return "coat_room";
    }

    if (!preprocessDone) {
        return "preprocess_service_room";
    }

    if (!invariantsRequested) {
        return "invariants_request";
    }

    // ------------------------------------------------------------
    // 3. Sequence complete
    // ------------------------------------------------------------
    return null;
}
