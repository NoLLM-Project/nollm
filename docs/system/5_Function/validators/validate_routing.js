// system/5_Function/validators/validate_routing.js

export function validateRouting(graph, spec, report) {

    for (const node of Object.values(graph)) {

        for (const adj of node.adjacent || []) {
            const target = graph[adj];
            if (!target) continue;

            // Rooms connect only to hallways
            if (node.type === "room" && spec.routing.rooms_connect_hallways_only) {
                if (target.type !== "hallway") {
                    report.routing.ok = false;
                    report.routing.errors.push(`${node.id} (room) adjacent to non-hallway ${adj}`);
                }
            }

            // Hallways connect same floor only
            if (node.type === "hallway" && spec.routing.hallways_connect_same_floor_only) {
                if (node.z !== target.z) {
                    report.routing.ok = false;
                    report.routing.errors.push(`${node.id} hallway connects across floors to ${adj}`);
                }
            }
        }
    }
}
