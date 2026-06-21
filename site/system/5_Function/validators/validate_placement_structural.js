// system/5_Function/validators/validate_placement_structural.js

export function validatePlacementStructural(placementRegistry, spec, report) {

    if (!spec.structural) return;

    for (const placement of Object.values(placementRegistry)) {

        const parent = placement.parent_id
            ? placementRegistry[placement.parent_id]
            : null;

        // Allowed parents
        if (spec.structural.allowed_parents_enforced && parent) {
            if (placement.allowed_parents &&
                !placement.allowed_parents.includes(parent.object_id)) {

                report.structural.ok = false;
                report.structural.errors.push(
                    `${placement.id} has parent '${parent.object_id}' not in allowed_parents`
                );
            }
        }

        // Allowed children
        if (spec.structural.allowed_children_enforced) {
            for (const childId of placement.children || []) {
                const child = placementRegistry[childId];
                if (!child) continue;

                if (placement.allowed_children &&
                    !placement.allowed_children.includes(child.object_id)) {

                    report.structural.ok = false;
                    report.structural.errors.push(
                        `${placement.id} has child '${child.object_id}' not in allowed_children`
                    );
                }
            }
        }
    }
}
