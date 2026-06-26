// system/5_Function/validators/validate_coordinate_hierarchy.js

export function validateCoordinateHierarchy(coordinateRegistry, spec, report) {
    for (const [id, coord] of Object.entries(coordinateRegistry)) {
        const type = coord.type;

        // World children
        if (type === "world" && spec.hierarchy.world_children_allowed) {
            for (const child of coord.children || []) {
                const childType = coordinateRegistry[child]?.type;
                if (!spec.hierarchy.world_children_allowed.includes(childType)) {
                    report.structure.ok = false;
                    report.structure.errors.push(
                        `World node ${id} has invalid child ${child} of type ${childType}`
                    );
                }
            }
        }

        // Hotel requires hotel root ancestor
        if (type === "hotel") {
            if (!hasAncestor(id, spec.hierarchy.hotel_requires_ancestor, coordinateRegistry)) {
                report.structure.ok = false;
                report.structure.errors.push(
                    `Hotel node ${id} does not descend from ${spec.hierarchy.hotel_requires_ancestor}`
                );
            }
        }

        // Floor requires hotel root ancestor
        if (type === "floor") {
            if (!hasAncestor(id, spec.hierarchy.floor_requires_ancestor, coordinateRegistry)) {
                report.structure.ok = false;
                report.structure.errors.push(
                    `Floor node ${id} does not descend from ${spec.hierarchy.floor_requires_ancestor}`
                );
            }
        }

        // Room requires parent type floor
        if (type === "room" && spec.hierarchy.room_requires_parent_type) {
            const parent = coordinateRegistry[coord.parent];
            if (!parent || parent.type !== spec.hierarchy.room_requires_parent_type) {
                report.structure.ok = false;
                report.structure.errors.push(
                    `Room ${id} must have parent of type ${spec.hierarchy.room_requires_parent_type}`
                );
            }
        }

        // Abstract cannot be under spatial
        if (type === "abstract" && spec.hierarchy.abstract_disallowed_under_spatial) {
            const parent = coordinateRegistry[coord.parent];
            if (parent && parent.type !== "abstract") {
                report.structure.ok = false;
                report.structure.errors.push(
                    `Abstract node ${id} cannot have spatial parent ${coord.parent}`
                );
            }
        }
    }
}

function hasAncestor(id, ancestorId, registry) {
    let current = registry[id];
    while (current?.parent) {
        if (current.parent === ancestorId) return true;
        current = registry[current.parent];
    }
    return false;
}
