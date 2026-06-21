// system/5_Function/validators/validate_coordinate_adjacency.js

export function validateCoordinateAdjacency(coordinateRegistry, spec, report) {
    for (const [id, coord] of Object.entries(coordinateRegistry)) {
        for (const adj of coord.adjacent || []) {
            const other = coordinateRegistry[adj];

            // Bidirectional
            if (spec.adjacency.bidirectional) {
                if (!other?.adjacent?.includes(id)) {
                    report.adjacency.ok = false;
                    report.adjacency.errors.push(
                        `Adjacency not bidirectional: ${id} → ${adj}`
                    );
                }
            }

            // Disallow parent
            if (spec.adjacency.disallow_parent && coord.parent === adj) {
                report.adjacency.ok = false;
                report.adjacency.errors.push(
                    `Coordinate ${id} is adjacent to its parent ${adj}`
                );
            }

            // Disallow children
            if (spec.adjacency.disallow_children && coord.children?.includes(adj)) {
                report.adjacency.ok = false;
                report.adjacency.errors.push(
                    `Coordinate ${id} is adjacent to its child ${adj}`
                );
            }

            // Disallow self
            if (spec.adjacency.disallow_self && id === adj) {
                report.adjacency.ok = false;
                report.adjacency.errors.push(
                    `Coordinate ${id} is adjacent to itself`
                );
            }
        }
    }
}
