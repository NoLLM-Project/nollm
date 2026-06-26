// system/5_Function/validators/validate_placement_integrity.js

export function validatePlacementIntegrity(placementRegistry, spec, report) {

    if (!spec.integrity) return;

    const parentChildPairs = new Set();
    const insidePairs = new Set();
    const adjacentPairs = new Set();

    for (const placement of Object.values(placementRegistry)) {

        // Parent-child integrity
        if (spec.integrity.no_duplicate_parent_child_pairs) {
            for (const childId of placement.children || []) {
                const key = `${placement.id}:${childId}`;
                if (parentChildPairs.has(key)) {
                    report.integrity.ok = false;
                    report.integrity.errors.push(
                        `${placement.id} duplicates parent-child pair '${key}'`
                    );
                }
                parentChildPairs.add(key);
            }
        }

        const c = placement.constraints || {};

        // Inside integrity
        if (spec.integrity.no_duplicate_inside_relations) {
            for (const id of c.must_be_inside || []) {
                const key = `${placement.id}:inside:${id}`;
                if (insidePairs.has(key)) {
                    report.integrity.ok = false;
                    report.integrity.errors.push(
                        `${placement.id} duplicates inside relation '${key}'`
                    );
                }
                insidePairs.add(key);
            }
        }

        // Adjacent integrity
        if (spec.integrity.no_duplicate_adjacent_relations) {
            for (const id of c.must_be_adjacent_to || []) {
                const key = `${placement.id}:adjacent:${id}`;
                if (adjacentPairs.has(key)) {
                    report.integrity.ok = false;
                    report.integrity.errors.push(
                        `${placement.id} duplicates adjacency relation '${key}'`
                    );
                }
                adjacentPairs.add(key);
            }
        }
    }
}
