// system/5_Function/validators/validate_metadata.js

export function validateMetadata(graph, skuMap, report) {

    for (const node of Object.values(graph)) {

        const category = node.category;
        if (!category) continue;

        const spec = skuMap[category];
        if (!spec) continue;

        const required = spec.required || [];

        for (const req of required) {
            if (!node.metadata?.includes(req)) {
                report.metadata.ok = false;
                report.metadata.errors.push(`${node.id} missing required metadata SKU: ${req}`);
            }
        }
    }
}
