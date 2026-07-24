// system/5_Function/validators/validate_naming_layers.js

export function validateNamingLayers(canonicalRegistry, spec, report) {

    const allowed = new Set(spec.layers.allowed_layers);

    for (const entry of Object.values(canonicalRegistry)) {

        // Layer must reflect true architectural layer
        if (spec.layers.layer_must_reflect_true_architectural_layer) {
            if (entry.layer !== entry.true_layer) {
                report.layers.ok = false;
                report.layers.errors.push(
                    `${entry.id} layer '${entry.layer}' does not match true layer '${entry.true_layer}'`
                );
            }
        }

        // Layer must be allowed
        if (!allowed.has(entry.layer)) {
            report.layers.ok = false;
            report.layers.errors.push(
                `${entry.id} layer '${entry.layer}' not in allowed layers`
            );
        }

        // Layers must not be repurposed
        if (spec.layers.layers_must_not_be_repurposed) {
            if (entry.previous_layer && entry.previous_layer !== entry.layer) {
                report.layers.ok = false;
                report.layers.errors.push(
                    `${entry.id} layer drift: '${entry.previous_layer}' → '${entry.layer}'`
                );
            }
        }
    }
}
