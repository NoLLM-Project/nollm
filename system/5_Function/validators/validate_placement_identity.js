// system/5_Function/validators/validate_placement_identity.js

export function validatePlacementIdentity(placementRegistry, spec, report) {

    if (!spec.identity) return;

    const ids = new Set();
    const objectIds = new Set();

    for (const placement of Object.values(placementRegistry)) {

        // Unique placement IDs
        if (spec.identity.unique_placement_ids) {
            if (ids.has(placement.id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Duplicate placement id '${placement.id}'`);
            }
            ids.add(placement.id);
        }

        // Unique object IDs
        if (spec.identity.unique_object_ids) {
            if (objectIds.has(placement.object_id)) {
                report.identity.ok = false;
                report.identity.errors.push(`Duplicate object_id '${placement.object_id}'`);
            }
            objectIds.add(placement.object_id);
        }
    }
}
