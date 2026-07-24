// system/5_Function/validators/validate_naming_types.js

export function validateNamingTypes(canonicalRegistry, spec, report) {

    const allowed = new Set(spec.types.allowed_types);

    for (const entry of Object.values(canonicalRegistry)) {

        // Type must match true identity
        if (spec.types.type_must_match_true_identity) {
            if (entry.type !== entry.true_type) {
                report.types.ok = false;
                report.types.errors.push(
                    `${entry.id} type '${entry.type}' does not match true identity '${entry.true_type}'`
                );
            }
        }

        // Type must be allowed
        if (!allowed.has(entry.type)) {
            report.types.ok = false;
            report.types.errors.push(
                `${entry.id} type '${entry.type}' not in allowed types`
            );
        }

        // Types must not drift
        if (spec.types.types_must_not_drift) {
            if (entry.previous_type && entry.previous_type !== entry.type) {
                report.types.ok = false;
                report.types.errors.push(
                    `${entry.id} type drift: '${entry.previous_type}' → '${entry.type}'`
                );
            }
        }
    }
}
