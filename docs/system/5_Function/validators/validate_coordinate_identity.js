// system/5_Function/validators/validate_coordinate_identity.js

export function validateCoordinateIdentity(coordinateRegistry, spec, report) {
    const ids = Object.keys(coordinateRegistry);
    const seen = new Set();

    for (const id of ids) {
        const coord = coordinateRegistry[id];

        // Unique IDs
        if (spec.identity.unique_ids) {
            if (seen.has(id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Duplicate coordinate id: ${id}`);
            }
            seen.add(id);
        }

        // Valid parent
        if (spec.identity.require_valid_parent) {
            if (coord.parent && !coordinateRegistry[coord.parent]) {
                report.identity.ok = false;
                report.identity.errors.push(`Coordinate ${id} has invalid parent: ${coord.parent}`);
            }
        }

        // Self in children
        if (spec.identity.disallow_self_in_children) {
            if (coord.children?.includes(id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Coordinate ${id} appears in its own children list`);
            }
        }

        // Self in adjacent
        if (spec.identity.disallow_self_in_adjacent) {
            if (coord.adjacent?.includes(id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Coordinate ${id} appears in its own adjacent list`);
            }
        }
    }
}
