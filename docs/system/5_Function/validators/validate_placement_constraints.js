// system/5_Function/validators/validate_placement_constraints.js

export function validatePlacementConstraints(placementRegistry, spec, report) {

    if (!spec.constraints) return;

    for (const placement of Object.values(placementRegistry)) {

        const c = placement.constraints || {};

        // Contradictory inside rules
        if (spec.constraints.no_contradictory_inside_rules) {
            for (const id of c.must_be_inside || []) {
                if ((c.cannot_be_inside || []).includes(id)) {
                    report.constraints.ok = false;
                    report.constraints.errors.push(
                        `${placement.id} has contradictory inside rules for '${id}'`
                    );
                }
            }
        }

        // Contradictory adjacency rules
        if (spec.constraints.no_contradictory_adjacent_rules) {
            for (const id of c.must_be_adjacent_to || []) {
                if ((c.cannot_be_adjacent_to || []).includes(id)) {
                    report.constraints.ok = false;
                    report.constraints.errors.push(
                        `${placement.id} has contradictory adjacency rules for '${id}'`
                    );
                }
            }
        }

        // Inside rules enforced
        if (spec.constraints.must_be_inside_enforced) {
            // Enforcement logic depends on your placement graph structure
            // Placeholder: structural validators will handle actual graph checks
        }

        if (spec.constraints.cannot_be_inside_enforced) {
            // Same note as above
        }

        // Adjacency rules enforced
        if (spec.constraints.must_be_adjacent_to_enforced) {
            // Placeholder for adjacency graph checks
        }

        if (spec.constraints.cannot_be_adjacent_to_enforced) {
            // Placeholder for adjacency graph checks
        }
    }
}
