// system/5_Function/validators/validate_placement_invariants.js

export function validatePlacementInvariants(placementRegistry, invariantRegistry, spec, report) {

    if (!spec.invariants) return;

    for (const placement of Object.values(placementRegistry)) {

        const inv = placement.invariants || [];

        // Unique invariant names inside each placement
        if (spec.invariants.invariant_names_must_be_unique) {
            const seen = new Set();
            for (const name of inv) {
                if (seen.has(name)) {
                    report.invariants.ok = false;
                    report.invariants.errors.push(
                        `${placement.id} has duplicate invariant '${name}'`
                    );
                }
                seen.add(name);
            }
        }

        // Invariant references must exist
        if (spec.invariants.invariant_references_must_exist) {
            for (const name of inv) {
                if (!invariantRegistry[name]) {
                    report.invariants.ok = false;
                    report.invariants.errors.push(
                        `${placement.id} references unknown invariant '${name}'`
                    );
                }
            }
        }
    }
}
