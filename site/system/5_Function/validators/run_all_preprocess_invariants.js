// system/5_Function/validators/run_all_preprocess_invariants.js

export function runAllPreprocessInvariants(carrier, registries) {

    const {
        canonicalRegistry,
        coordinateRegistry,
        metadataRegistry,
        skuRegistry
    } = registries;

    const report = {
        structure: { ok: true, errors: [] },
        registry: { ok: true, errors: [] },
        semantics: { ok: true, errors: [] },
        geometry: { ok: true, errors: [] },
        engine: { ok: true, errors: [] },
        overall_ok: true
    };

    // ------------------------------------------------------------
    // 1. STRUCTURE INVARIANTS
    // ------------------------------------------------------------
    if (typeof carrier.raw !== "string") {
        report.structure.ok = false;
        report.structure.errors.push("carrier.raw must be a string");
    }

    if (typeof carrier.text !== "string") {
        report.structure.ok = false;
        report.structure.errors.push("carrier.text must be a string");
    }

    if (!(carrier.parsed === null || typeof carrier.parsed === "object")) {
        report.structure.ok = false;
        report.structure.errors.push("carrier.parsed must be null or an object");
    }

    if (!(carrier.extracted && typeof carrier.extracted === "object")) {
        report.structure.ok = false;
        report.structure.errors.push("carrier.extracted must be an object");
    }

    // ------------------------------------------------------------
    // 2. REGISTRY INVARIANTS
    // ------------------------------------------------------------
    if (carrier.extracted && typeof carrier.extracted === "object") {
        for (const key of Object.keys(carrier.extracted)) {

            // metadata references must exist
            if (!metadataRegistry[key]) {
                report.registry.ok = false;
                report.registry.errors.push(
                    `extracted key "${key}" does not exist in metadata registry`
                );
            }

            // coordinate references must exist
            const coord = carrier.extracted[key]?.coordinate;
            if (coord && !coordinateRegistry[coord]) {
                report.registry.ok = false;
                report.registry.errors.push(
                    `coordinate "${coord}" for key "${key}" does not exist in coordinate registry`
                );
            }

            // SKU references must exist
            const sku = carrier.extracted[key]?.sku;
            if (sku && !skuRegistry[sku]) {
                report.registry.ok = false;
                report.registry.errors.push(
                    `SKU "${sku}" for key "${key}" does not exist in SKU registry`
                );
            }
        }
    }

    // ------------------------------------------------------------
    // 3. SEMANTICS‑PROTECTION INVARIANTS
    // ------------------------------------------------------------
    const forbiddenSemanticFields = [
        "type",
        "intent",
        "category",
        "classification",
        "meaning",
        "inferred",
        "semantic",
        "label"
    ];

    if (carrier.extracted && typeof carrier.extracted === "object") {
        for (const [key, value] of Object.entries(carrier.extracted)) {
            for (const forbidden of forbiddenSemanticFields) {
                if (value && Object.prototype.hasOwnProperty.call(value, forbidden)) {
                    report.semantics.ok = false;
                    report.semantics.errors.push(
                        `extracted["${key}"] contains forbidden semantic field "${forbidden}"`
                    );
                }
            }
        }
    }

    // ------------------------------------------------------------
    // 4. GEOMETRY‑NEUTRALITY INVARIANTS
    // ------------------------------------------------------------
    const forbiddenGeometryFields = [
        "x", "y", "z",
        "adjacent",
        "parent",
        "children",
        "placement",
        "layout"
    ];

    if (carrier.extracted && typeof carrier.extracted === "object") {
        for (const [key, value] of Object.entries(carrier.extracted)) {
            for (const forbidden of forbiddenGeometryFields) {
                if (value && Object.prototype.hasOwnProperty.call(value, forbidden)) {
                    report.geometry.ok = false;
                    report.geometry.errors.push(
                        `extracted["${key}"] contains forbidden geometry field "${forbidden}"`
                    );
                }
            }
        }
    }

    // ------------------------------------------------------------
    // 5. ENGINE‑READINESS INVARIANTS
    // ------------------------------------------------------------
    const forbiddenNondeterministicFields = [
        "timestamp",
        "uuid",
        "random",
        "nonce"
    ];

    if (carrier.extracted && typeof carrier.extracted === "object") {
        for (const [key, value] of Object.entries(carrier.extracted)) {
            for (const forbidden of forbiddenNondeterministicFields) {
                if (value && Object.prototype.hasOwnProperty.call(value, forbidden)) {
                    report.engine.ok = false;
                    report.engine.errors.push(
                        `extracted["${key}"] contains nondeterministic field "${forbidden}"`
                    );
                }
            }
        }
    }

    // ------------------------------------------------------------
    // OVERALL
    // ------------------------------------------------------------
    report.overall_ok = Object.values(report)
        .filter(section => typeof section === "object" && "ok" in section)
        .every(section => section.ok);

    return report;
}
