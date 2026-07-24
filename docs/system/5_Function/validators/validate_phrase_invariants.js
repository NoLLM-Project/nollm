// system/5_Function/validators/validate_phrase_invariants.js

export function validatePhraseInvariants(entries) {
    const errors = [];
    const warnings = [];

    const seenIds = new Set();
    const seenSurfaces = new Set();

    for (const entry of entries) {
        const { id, surface, subtype } = entry;

        if (!/^[A-Z][0-9]{8}$/.test(id)) {
            errors.push({ entry, issue: "INVALID_ID_FORMAT" });
        }

        if (!/^[A-Z0-9_]+$/.test(subtype)) {
            errors.push({ entry, issue: "INVALID_SUBTYPE_FORMAT" });
        }

        if (seenIds.has(id)) {
            errors.push({ entry, issue: "DUPLICATE_ID" });
        }

        const s = surface.toLowerCase();
        if (seenSurfaces.has(s)) {
            warnings.push({ entry, issue: "DUPLICATE_SURFACE" });
        }

        seenIds.add(id);
        seenSurfaces.add(s);
    }

    return {
        ok: errors.length === 0,
        errors,
        warnings
    };
}
