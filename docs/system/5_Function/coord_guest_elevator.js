// system/5_Function/coord_guest_elevator.js

export function coord_guest_elevator({ workflowContext, carrier, userToken, xyz }) {

    // This node is circulation-only.
    // It assumes we're already past intake and invariants.

    return {
        phase: "guest_elevator",
        // No logic, no routing decisions here.
        // Just advance to the movement step in the elevator loop.
        next_path: "guest_elevator_move"
    };
}
