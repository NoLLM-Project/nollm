// system/5_Function/validators/validate_naming_integrity.js

export function validateNamingIntegrity(canonicalRegistry, aliasRegistry, spec, report) {

    const canonicalIds = new Set(Object.keys(canonicalRegistry));

    // Every alias must reference existing canonical ID
    if (spec.registry_integrity.alias_must_reference_existing_canonical_id) {
        for (const alias of Object.values(aliasRegistry)) {
            if (!canonicalIds.has(alias.canonical_id)) {
                report.registry_integrity.ok = false;
                report.registry_integrity.errors.push(
                    `Alias '${alias.name}' references missing canonical ID '${alias.canonical_id}'`
                );
            }
        }
    }

    // No orphan canonical IDs
    if (spec.registry_integrity.no_orphan_canonical_ids) {
        for (const id of canonicalIds) {
            const entry = canonicalRegistry[id];
            if (!entry.used_in_system) {
                report.registry_integrity.ok = false;
                report.registry_integrity.errors.push(
                    `Canonical ID '${id}' is orphaned`
                );
            }
        }
    }
}
