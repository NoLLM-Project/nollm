// system/5_Function/validators/validate_coordinate_integrity.js

export function validateCoordinateIntegrity(coordinateRegistry, spec, report) {

    // No cycles
    if (spec.integrity.no_cycles) {
        for (const id of Object.keys(coordinateRegistry)) {
            if (detectCycle(id, coordinateRegistry)) {
                report.integrity.ok = false;
                report.integrity.errors.push(`Cycle detected at ${id}`);
            }
        }
    }

    // World connected
    if (spec.integrity.world_connected_root) {
        if (!isConnected(spec.integrity.world_connected_root, coordinateRegistry)) {
            report.integrity.ok = false;
            report.integrity.errors.push(`World graph not connected at root`);
        }
    }

    // Hotel connected
    if (spec.integrity.hotel_connected_root) {
        if (!isConnected(spec.integrity.hotel_connected_root, coordinateRegistry)) {
            report.integrity.ok = false;
            report.integrity.errors.push(`Hotel graph not connected at root`);
        }
    }

    // Floor stack continuous
    if (spec.integrity.floor_stack_continuous) {
        const floors = Object.values(coordinateRegistry)
            .filter(c => c.type === "floor")
            .map(c => c.z)
            .sort((a, b) => a - b);

        for (let i = 1; i < floors.length; i++) {
            if (floors[i] !== floors[i - 1] + 1) {
                report.integrity.ok = false;
                report.integrity.errors.push(`Missing floor between z=${floors[i - 1]} and z=${floors[i]}`);
            }
        }
    }
}

function detectCycle(id, registry, visited = new Set()) {
    if (visited.has(id)) return true;
    visited.add(id);

    const parent = registry[id]?.parent;
    if (!parent) return false;

    return detectCycle(parent, registry, visited);
}

function isConnected(rootId, registry) {
    const visited = new Set();
    const stack = [rootId];

    while (stack.length) {
        const id = stack.pop();
        if (visited.has(id)) continue;
        visited.add(id);

        const coord = registry[id];
        if (!coord) continue;

        for (const child of coord.children || []) stack.push(child);
    }

    return visited.size > 0;
}
