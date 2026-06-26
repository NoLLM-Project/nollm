// system/5_Function/validators/validate_metadata_properties.js

export function validateMetadataProperties(metadataRegistry, spec, report) {

    for (const meta of Object.values(metadataRegistry)) {

        const props = meta.properties || {};

        // Literal-only properties
        if (spec.properties.properties_literal_only) {
            for (const [key, value] of Object.entries(props)) {
                if (typeof value === "object") {
                    report.properties.ok = false;
                    report.properties.errors.push(
                        `${meta.id} property '${key}' must be literal, not object`
                    );
                }
            }
        }

        // Forbidden semantic behaviors
        const forbidden = [
            ["forbid_inference", "inference"],
            ["forbid_prediction", "prediction"],
            ["forbid_semantic_expansion", "semantic_expansion"],
            ["forbid_auto_summaries", "auto_summary"],
            ["forbid_hidden_behavior", "hidden_behavior"]
        ];

        for (const [flag, key] of forbidden) {
            if (spec.properties[flag] && props[key] !== undefined) {
                report.properties.ok = false;
                report.properties.errors.push(
                    `${meta.id} property '${key}' is forbidden by metadata invariants`
                );
            }
        }

        // Structural-only properties
        if (spec.properties.properties_must_be_structural) {
            if (props.behavior || props.intent || props.meaning) {
                report.properties.ok = false;
                report.properties.errors.push(
                    `${meta.id} contains non-structural properties`
                );
            }
        }
    }
}
