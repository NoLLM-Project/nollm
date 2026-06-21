// system/5_Function/coord_coat_room.js

export function coord_coat_room({ workflowContext, userToken }) {

    const hotelRoot = workflowContext["coord_hotel_root"];

    // 1. REQUIRE: hotel_root must have run
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "coat_room",
            error: "Hotel Root has not run yet",
            metadata_id: null,
            next_path: null,
            userToken: null
        };
    }

    const metadataId = hotelRoot.metadata_id;

    // ------------------------------------------------------------
    // 2. INTERNAL STANCE ANCHORS
    // ------------------------------------------------------------

    function applyReflectiveModeAnchor(token) {
        return { ...token, stance_reflective_mode: true };
    }

    function applyArchitecturalAltitudeAnchor(token) {
        return { ...token, stance_architectural_altitude: "high" };
    }

    function applyAvoidDriftAnchor(token) {
        return { ...token, stance_avoid_drift: true };
    }

    function applyStayLiteralAnchor(token) {
        return { ...token, stance_stay_literal: true };
    }

    function applySteadyStanceAnchor(token) {
        return { ...token, stance_steady_stance: true };
    }

    // ------------------------------------------------------------
    // 3. INTERNAL COAT ROOM NOTEPAD
    // ------------------------------------------------------------

    function applyCoatRoomNotepad(token, context) {
        const notes = context["coat_room_notepad"] || null;
        return { ...token, coat_room_notepad: notes };
    }

    // ------------------------------------------------------------
    // 4. APPLY ALL INTERNAL ACTIONS
    // ------------------------------------------------------------

    let updatedToken = userToken || {};

    updatedToken = applyReflectiveModeAnchor(updatedToken);
    updatedToken = applyArchitecturalAltitudeAnchor(updatedToken);
    updatedToken = applyAvoidDriftAnchor(updatedToken);
    updatedToken = applyStayLiteralAnchor(updatedToken);
    updatedToken = applySteadyStanceAnchor(updatedToken);

    updatedToken = applyCoatRoomNotepad(updatedToken, workflowContext);

    // ------------------------------------------------------------
    // 5. RETURN TO FRONT DESK
    // ------------------------------------------------------------

    return {
        phase: "coat_room",
        metadata_id: metadataId,
        next_path: "front_desk",
        userToken: updatedToken
    };
}
