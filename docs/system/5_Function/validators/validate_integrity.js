// system/5_Function/validators/validate_integrity.js

export function validateIntegrity(graph, spec, report) {

    // Parent-child cycles
    if (spec.integrity.no_parent_child_cycles) {
        for (const node of Object.values(graph)) {
            if (detectCycle(graph, node)) {
                report.integrity.ok = false;
                report.integrity.errors.push(`Cycle detected starting at ${node.id}`);
            }
        }
    }

    // Connectivity checks (world + hotel)
    if (spec.integrity.world_graph_connected_via_world_root) {
        if (!isConnected(graph, "coord_world_root")) {
            report.integrity.ok = false;
            report.integrity.errors.push(`World graph not connected via coord_world_root`);
        }
    }

    if (spec.integrity.hotel_graph_connected_via_hotel_root) {
        if (!isConnected(graph, "coord_hotel_root")) {
            report.integrity.ok = false;
            report.integrity.errors.push(`Hotel graph not connected via coord_hotel_root`);
        }
    }

    // Floor stack continuity
    if (spec.integrity.floor_stack_continuous) {
        const floors = Object.values(graph)
            .filter(n => n.type === "floor")
            .map(n => n.z)
            .sort((a, b) => a - b);

        for (let i = 1; i < floors.length; i++) {
            if (floors[i] !== floors[i - 1] + 1) {
                report.integrity.ok = false;
                report.integrity.errors.push(`Floor stack discontinuity at z=${floors[i]}`);
            }
        }
    }
}

function detectCycle(graph, node) {
    const visited = new Set();
    let current = node;
    while (current) {
        if (visited.has(current.id)) return true;
        visited.add(current.id);
        current = graph[current.parent];
    }
    return false;
}

function isConnected(graph, rootId) {
    const root = graph[rootId];
    if (!root) return false;

    const visited = new Set();
    const stack = [root];

    while (stack.length) {
        const node = stack.pop();
        if (!node || visited.has(node.id)) continue;
        visited.add(node.id);
        for (const child of node.children || []) {
            stack.push(graph[child]);
        }
    }

    // All nodes of same domain must be reachable
    const domain = root.type;
    const domainNodes = Object.values(graph).filter(n => n.type === domain);
    return domainNodes.every(n => visited.has(n.id));
}
