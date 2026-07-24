// system/5_Function/validators/validate_identity_hierarchy.js

export function validateIdentityAndHierarchy(graph, spec, report) {

    const ids = new Set();

    for (const node of Object.values(graph)) {

        // Unique ID
        if (spec.identity.unique_ids) {
            if (ids.has(node.id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Duplicate id: ${node.id}`);
            }
            ids.add(node.id);
        }

        // Valid parent
        if (spec.identity.require_valid_parent) {
            if (node.parent && !graph[node.parent]) {
                report.identity.ok = false;
                report.identity.errors.push(`Invalid parent for ${node.id}: ${node.parent}`);
            }
        }

        // Self in children
        if (spec.identity.forbid_self_in_children) {
            if (node.children?.includes(node.id)) {
                report.identity.ok = false;
                report.identity.errors.push(`${node.id} appears in its own children list`);
            }
        }

        // Self in adjacency
        if (spec.identity.forbid_self_in_adjacent) {
            if (node.adjacent?.includes(node.id)) {
                report.identity.ok = false;
                report.identity.errors.push(`${node.id} appears in its own adjacent list`);
            }
        }

        // Hierarchy rules
        if (spec.hierarchy) {
            const parent = graph[node.parent];

            if (node.type === "hotel" && spec.hierarchy.hotel_requires_hotel_root_ancestor) {
                if (!hasAncestor(graph, node, "coord_hotel_root")) {
                    report.hierarchy.ok = false;
                    report.hierarchy.errors.push(`${node.id} is hotel-level but not under coord_hotel_root`);
                }
            }

            if (node.type === "floor" && spec.hierarchy.floor_requires_hotel_root_ancestor) {
                if (!hasAncestor(graph, node, "coord_hotel_root")) {
                    report.hierarchy.ok = false;
                    report.hierarchy.errors.push(`${node.id} is floor-level but not under coord_hotel_root`);
                }
            }

            if (node.type === "room" && spec.hierarchy.room_requires_floor_parent) {
                if (!parent || parent.type !== "floor") {
                    report.hierarchy.ok = false;
                    report.hierarchy.errors.push(`${node.id} is room-level but parent is not a floor`);
                }
            }

            if (node.type === "abstract" && spec.hierarchy.abstract_forbid_under_spatial) {
                if (parent && parent.type !== "abstract") {
                    report.hierarchy.ok = false;
                    report.hierarchy.errors.push(`${node.id} is abstract but parent is spatial`);
                }
            }
        }
    }
}

function hasAncestor(graph, node, ancestorId) {
    let current = node;
    while (current?.parent) {
        if (current.parent === ancestorId) return true;
        current = graph[current.parent];
    }
    return false;
}
