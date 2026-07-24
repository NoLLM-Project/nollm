// system/5_Function/validators/validate_routing_ui.js

export function validateRoutingUI(routes, spec, report) {

    for (const r of routes) {

        // UI → UI stays in UI space
        if (spec.ui_routing.ui_to_ui_stays_in_ui_space) {
            if (r.source_type === "ui" && r.target_type !== "ui") {
                report.ui_routing.ok = false;
                report.ui_routing.errors.push(
                    `${r.id} ui→non-ui violates UI space invariant`
                );
            }
        }

        // UI → Surface must not load scenes
        if (spec.ui_routing.ui_to_surface_must_not_load_scenes) {
            if (r.source_type === "ui" && r.target_type === "surface" && r.action === "load_scene") {
                report.ui_routing.ok = false;
                report.ui_routing.errors.push(
                    `${r.id} ui→surface cannot load scenes`
                );
            }
        }

        // UI → Error must not modify world state
        if (spec.ui_routing.ui_to_error_must_not_modify_world_state) {
            if (r.target_type === "ui_error" && r.modifies_world_state) {
                report.ui_routing.ok = false;
                report.ui_routing.errors.push(
                    `${r.id} ui→error modifies world state`
                );
            }
        }

        // UI → State Machine must follow allowed transitions
        if (spec.ui_routing.ui_to_state_machine_must_follow_allowed_transitions) {
            if (r.target_type === "ui_state_machine" && !r.allowed) {
                report.ui_routing.ok = false;
                report.ui_routing.errors.push(
                    `${r.id} ui→state_machine violates allowed transitions`
                );
            }
        }
    }
}
