// system/5_Function/validators/validate_routing_transitions.js

export function validateRoutingTransitions(routes, spec, report) {

    for (const r of routes) {

        // Literal, non-inferential
        if (spec.transitions.transitions_literal_non_inferential) {
            if (r.inferential === true) {
                report.transitions.ok = false;
                report.transitions.errors.push(
                    `${r.id} transition is inferential`
                );
            }
        }

        if (spec.transitions.transitions_must_not_imply_prediction && r.prediction === true) {
            report.transitions.ok = false;
            report.transitions.errors.push(`${r.id} implies prediction`);
        }

        if (spec.transitions.transitions_must_not_imply_inference && r.inference === true) {
            report.transitions.ok = false;
            report.transitions.errors.push(`${r.id} implies inference`);
        }

        if (spec.transitions.transitions_must_not_imply_semantic_expansion && r.semantic_expansion === true) {
            report.transitions.ok = false;
            report.transitions.errors.push(`${r.id} implies semantic expansion`);
        }

        if (spec.transitions.transitions_must_not_imply_auto_navigation && r.auto_navigation === true) {
            report.transitions.ok = false;
            report.transitions.errors.push(`${r.id} implies auto-navigation`);
        }
    }
}
