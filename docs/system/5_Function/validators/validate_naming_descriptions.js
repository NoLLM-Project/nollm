// system/5_Function/validators/validate_naming_descriptions.js

export function validateNamingDescriptions(canonicalRegistry, spec, report) {

    for (const entry of Object.values(canonicalRegistry)) {

        const desc = entry.description;

        if (!desc) continue;

        // Literal
        if (spec.descriptions.descriptions_literal && desc.contains_metaphor) {
            report.descriptions.ok = false;
            report.descriptions.errors.push(
                `${entry.id} description contains metaphorical content`
            );
        }

        // Non-narrative
        if (spec.descriptions.descriptions_non_narrative && desc.contains_story) {
            report.descriptions.ok = false;
            report.descriptions.errors.push(
                `${entry.id} description contains narrative content`
            );
        }

        // Must not encode behavior
        if (spec.descriptions.descriptions_must_not_encode_behavior && desc.contains_behavior) {
            report.descriptions.ok = false;
            report.descriptions.errors.push(
                `${entry.id} description encodes behavior`
            );
        }
    }
}
