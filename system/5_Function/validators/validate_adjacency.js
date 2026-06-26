// system/5_Function/validators/validate_adjacency.js

export function validateAdjacency(graph, spec, report) {

    for (const node of Object.values(graph)) {

        for (const adj of node.adjacent || []) {

            const target = graph[adj];
            if (!target) continue;

            // Bidirectional
            if (spec.adjacency.bidirectional) {
                if (!target.adjacent?.includes(node.id)) {
                    report.adjacency.ok = false;
                    report.adjacency.errors.push(`Adjacency not bidirectional: ${node.id} → ${adj}`);
                }
            }

            // No parent/child adjacency
            if (spec.adjacency.forbid_parent_child_adjacency) {
                if (node.parent === adj || target.parent === node.id) {
                    report.adjacency.ok = false;
                    report.adjacency.errors.push(`Parent/child adjacency forbidden: ${node.id} ↔ ${adj}`);
                }
            }

            // No self adjacency
            if (spec.adjacency.forbid_self_adjacency && node.id === adj) {
                report.adjacency.ok = false;
                report.adjacency.errors.push(`Self adjacency forbidden: ${node.id}`);
            }
        }
    }
}
