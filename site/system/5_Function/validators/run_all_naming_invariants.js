// system/5_Function/validators/run_all_naming_invariants.js

import { loadNamingInvariants } from "./load_naming_invariants.js";
import { validateNamingCanonical } from "./validate_naming_canonical.js";
import { validateNamingPrefixes } from "./validate_naming_prefixes.js";
import { validateNamingAliases } from "./validate_naming_aliases.js";
import { validateNamingTypes } from "./validate_naming_types.js";
import { validateNamingLayers } from "./validate_naming_layers.js";
import { validateNamingDescriptions } from "./validate_naming_descriptions.js";
import { validateNamingIntegrity } from "./validate_naming_integrity.js";

export function runAllNamingInvariants(canonicalRegistry, aliasRegistry) {

    const spec = loadNamingInvariants();

    const report = {
        canonical_names: { ok: true, errors: [] },
        sovereign_prefixes: { ok: true, errors: [] },
        aliases: { ok: true, errors: [] },
        types: { ok: true, errors: [] },
        layers: { ok: true, errors: [] },
        descriptions: { ok: true, errors: [] },
        registry_integrity: { ok: true, errors: [] },
        overall_ok: true
    };

    validateNamingCanonical(canonicalRegistry, spec, report);
    validateNamingPrefixes(canonicalRegistry, spec, report);
    validateNamingAliases(aliasRegistry, canonicalRegistry, spec, report);
    validateNamingTypes(canonicalRegistry, spec, report);
    validateNamingLayers(canonicalRegistry, spec, report);
    validateNamingDescriptions(canonicalRegistry, spec, report);
    validateNamingIntegrity(canonicalRegistry, aliasRegistry, spec, report);

    report.overall_ok = Object.values(report)
        .filter(s => typeof s === "object" && "ok" in s)
        .every(s => s.ok);

    return report;
}
