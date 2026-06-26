// system/5_Function/validators/validate_abstract.js

export function validateAbstractSpace(graph, spec, report) {

    for (const node of Object.values(graph)) {

        if (node.type !== "abstract") continue;

        // xyz must be null
        if (spec.abstract_space.xyz_must_be_null) {
            if (node.x !== null || node.y !== null || node.z !== null) {
                report.abstract.ok = false;
                report.abstract.errors.push(`${node.id} is abstract but has xyz values`);
            }
        }

        // No adjacency to spatial
        if (spec.abstract_space.forbid_adjacent_to_spatial) {
            for (const adj of node.adjacent || []) {
                const target = graph[adj];
                if (target && target.type !== "abstract") {
                    report.abstract.ok = false;
                    report.abstract.errors.push(`${node.id} (abstract) adjacent to spatial ${adj}`);
                }
            }
        }
    }
}
