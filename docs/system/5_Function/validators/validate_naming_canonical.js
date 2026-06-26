// system/5_Function/validators/validate_naming_canonical.js

export function validateNamingCanonical(canonicalRegistry, spec, report) {

    const names = new Set();

    for (const entry of Object.values(canonicalRegistry)) {

        // Exactly one canonical name
        if (spec.canonical_names.exactly_one_canonical_name) {
            if (!entry.canonical || typeof entry.canonical !== "string") {
                report.canonical_names.ok = false;
                report.canonical_names.errors.push(
                    `${entry.id} missing canonical name`
                );
            }
        }

        // Unique canonical names
        if (spec.canonical_names.canonical_names_unique) {
            if (names.has(entry.canonical)) {
                report.canonical_names.ok = false;
                report.canonical_names.errors.push(
                    `Duplicate canonical name '${entry.canonical}'`
                );
            }
            names.add(entry.canonical);
        }

        // Canonical names stable
        if (spec.canonical_names.canonical_names_stable) {
            if (entry.previous_canonical && entry.previous_canonical !== entry.canonical) {
                report.canonical_names.ok = false;
                report.canonical_names.errors.push(
                    `${entry.id} canonical name changed from '${entry.previous_canonical}'`
                );
            }
        }

        // Canonical reflects true identity
        if (spec.canonical_names.canonical_reflect_true_identity) {
            if (entry.true_identity && entry.true_identity !== entry.canonical) {
                report.canonical_names.ok = false;
                report.canonical_names.errors.push(
                    `${entry.id} canonical '${entry.canonical}' does not match true identity '${entry.true_identity}'`
                );
            }
        }
    }
}
