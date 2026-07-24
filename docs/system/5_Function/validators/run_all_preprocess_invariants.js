// system/5_Function/validators/run_all_preprocess_invariants.js

export function runAllPreprocessInvariants(payload, registries) {

    const {
        canonicalRegistry,
        coordinateRegistry,
        metadataRegistry,
        skuRegistry
    } = registries;

    // ⭐ GUARD — prevents JS choke when registries are missing
    if (
        !metadataRegistry || typeof metadataRegistry !== "object" ||
        !coordinateRegistry || typeof coordinateRegistry !== "object" ||
        !skuRegistry || typeof skuRegistry !== "object"
    ) {
        return {
            structure: { ok: true, errors: [] },
            registry: { ok: false, errors: ["One or more preprocess registries missing or invalid"] },
            semantics: { ok: true, errors: [] },
            geometry: { ok: true, errors: [] },
            engine: { ok: true, errors: [] },
            overall_ok: false
        };
    }

    const report = {
        structure: { ok: true, errors: [] },
        registry: { ok: true, errors: [] },
        semantics: { ok: true, errors: [] },
        geometry: { ok: true, errors: [] },
        engine: { ok: true, errors: [] },
        overall_ok: true
    };

    // ------------------------------------------------------------
    // 1. STRUCTURE INVARIANTS (rawText/text required, parsed/extracted optional)
    // ------------------------------------------------------------

    if (typeof payload.rawText !== "string") {
        report.structure.ok = false;
        report.structure.errors.push("payload.rawText must be a string");
    }

    if (typeof payload.text !== "string") {
        report.structure.ok = false;
        report.structure.errors.push("payload.text must be a string");
    }

    // parsed is OPTIONAL
    if (payload.parsed !== undefined &&
        !(payload.parsed === null || typeof payload.parsed === "object")) {
        report.structure.ok = false;
        report.structure.errors.push("payload.parsed must be null, an object, or undefined");
    }

    // extracted is OPTIONAL
    if (payload.extracted !== undefined &&
        !(payload.extracted && typeof payload.extracted === "object")) {
        report.structure.ok = false;
        report.structure.errors.push("payload.extracted must be an object if present");
    }

    // ------------------------------------------------------------
    // 2. REGISTRY INVARIANTS (only if extracted exists)
    // ------------------------------------------------------------
    if (payload.extracted && typeof payload.extracted === "object") {
        for (const key of Object.keys(payload.extracted)) {

            if (!metadataRegistry[key]) {
                report.registry.ok = false;
                report.registry.errors.push(
                    `extracted key "${key}" does not exist in metadata registry`
                );
            }

            const coord = payload.extracted[key]?.coordinate;
            if (coord && !coordinateRegistry[coord]) {
                report.registry.ok = false;
                report.registry.errors.push(
                    `coordinate "${coord}" for key "${key}" does not exist in coordinate registry`
                );
            }

            const sku = payload.extracted[key]?.sku;
            if (sku && !skuRegistry[sku]) {
                report.registry.ok = false;
                report.registry.errors.push(
                    `SKU "${sku}" for key "${key}" does not exist in SKU registry`
                );
            }
        }
    }

    // ------------------------------------------------------------
    // 3. SEMANTICS‑PROTECTION INVARIANTS (only if extracted exists)
    // ------------------------------------------------------------
    const forbiddenSemanticFields = [
        "type", "intent", "category", "classification",
        "meaning", "inferred", "semantic", "label"
    ];

    if (payload.extracted && typeof payload.extracted === "object") {
        for (const [key, value] of Object.entries(payload.extracted)) {
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
    // 4. GEOMETRY‑NEUTRALITY INVARIANTS (only if extracted exists)
    // ------------------------------------------------------------
    const forbiddenGeometryFields = [
        "x", "y", "z",
        "adjacent", "parent", "children",
        "placement", "layout"
    ];

    if (payload.extracted && typeof payload.extracted === "object") {
        for (const [key, value] of Object.entries(payload.extracted)) {
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
    // 5. ENGINE‑READINESS INVARIANTS (only if extracted exists)
    // ------------------------------------------------------------
    const forbiddenNondeterministicFields = [
        "timestamp", "uuid", "random", "nonce"
    ];

    if (payload.extracted && typeof payload.extracted === "object") {
        for (const [key, value] of Object.entries(payload.extracted)) {
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
