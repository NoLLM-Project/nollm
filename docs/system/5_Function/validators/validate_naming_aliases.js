// system/5_Function/validators/validate_naming_aliases.js

export function validateNamingAliases(aliasRegistry, canonicalRegistry, spec, report) {

    const aliasNames = new Set();
    const canonicalNames = new Set(
        Object.values(canonicalRegistry).map(e => e.canonical)
    );

    for (const alias of Object.values(aliasRegistry)) {

        // Alias resolves to single canonical ID
        if (spec.aliases.alias_resolves_to_single_canonical_id) {
            if (!canonicalRegistry[alias.canonical_id]) {
                report.aliases.ok = false;
                report.aliases.errors.push(
                    `Alias '${alias.name}' references missing canonical ID '${alias.canonical_id}'`
                );
            }
        }

        // Alias must not collide with canonical names
        if (spec.aliases.alias_not_collide_with_canonical) {
            if (canonicalNames.has(alias.name)) {
                report.aliases.ok = false;
                report.aliases.errors.push(
                    `Alias '${alias.name}' collides with canonical name`
                );
            }
        }

        // Alias must not collide with other aliases
        if (spec.aliases.alias_not_collide_with_alias) {
            if (aliasNames.has(alias.name)) {
                report.aliases.ok = false;
                report.aliases.errors.push(
                    `Alias '${alias.name}' collides with another alias`
                );
            }
            aliasNames.add(alias.name);
        }

        // Alias must not imply wrong type/layer
        if (spec.aliases.alias_not_imply_wrong_type_or_layer) {
            const canonical = canonicalRegistry[alias.canonical_id];
            if (canonical && alias.type && alias.type !== canonical.type) {
                report.aliases.ok = false;
                report.aliases.errors.push(
                    `Alias '${alias.name}' type '${alias.type}' contradicts canonical type '${canonical.type}'`
                );
            }
        }

        // Alias must not introduce ambiguity
        if (spec.aliases.alias_no_ambiguity) {
            if (alias.ambiguous === true) {
                report.aliases.ok = false;
                report.aliases.errors.push(
                    `Alias '${alias.name}' introduces ambiguity`
                );
            }
        }
    }
}
