// system/5_Function/validators/validate_naming_prefixes.js

export function validateNamingPrefixes(canonicalRegistry, spec, report) {

    const prefixMap = spec.sovereign_prefixes.prefix_map;

    for (const entry of Object.values(canonicalRegistry)) {

        const canonical = entry.canonical;
        if (!canonical) continue;

        const prefix = canonical.slice(0, 2); // e.g., "A_"

        if (prefixMap[prefix]) {

            // Prefixes are structural, not temporal
            if (spec.sovereign_prefixes.prefixes_are_structural_not_temporal) {
                if (entry.interpretation === "temporal") {
                    report.sovereign_prefixes.ok = false;
                    report.sovereign_prefixes.errors.push(
                        `${entry.id} incorrectly interprets prefix '${prefix}' as temporal`
                    );
                }
            }

            // Prefix must not imply versioning or eras
            if (spec.sovereign_prefixes.prefixes_not_versioning_or_eras) {
                if (entry.interpretation === "version") {
                    report.sovereign_prefixes.ok = false;
                    report.sovereign_prefixes.errors.push(
                        `${entry.id} incorrectly interprets prefix '${prefix}' as versioning`
                    );
                }
            }

            // Prefix must match container class
            if (spec.sovereign_prefixes.prefixes_define_container_class) {
                if (entry.container_class && entry.container_class !== prefixMap[prefix]) {
                    report.sovereign_prefixes.ok = false;
                    report.sovereign_prefixes.errors.push(
                        `${entry.id} prefix '${prefix}' does not match container class '${entry.container_class}'`
                    );
                }
            }
        }
    }
}
