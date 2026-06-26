// system/5_Function/validators/run_all_postprocess_invariants.js

export function runAllPostprocessInvariants(carrier, postprocessPlan) {

    const {
        func,        // resolved function descriptor
        outputField  // the field postprocess is expected to populate
    } = postprocessPlan || {};

    const report = {
        structure:     { ok: true, errors: [] },
        representation:{ ok: true, errors: [] },
        semantics:     { ok: true, errors: [] },
        determinism:   { ok: true, errors: [] },
        safety:        { ok: true, errors: [] },
        reversible:    { ok: true, errors: [] },
        overall_ok:    true
    };

    // ------------------------------------------------------------
    // 1. STRUCTURE INVARIANTS
    // ------------------------------------------------------------

    const output = carrier?.[outputField];

    if (output === undefined) {
        report.structure.ok = false;
        report.structure.errors.push(
            `carrier["${outputField}"] is missing`
        );
    } else {
        const t = typeof output;

        const isPlainObject =
            t === "object" &&
            output !== null &&
            output.constructor === Object;

        const isArrayOfStrings =
            Array.isArray(output) &&
            output.every(v => typeof v === "string");

        const isArrayOfObjects =
            Array.isArray(output) &&
            output.every(v => v && typeof v === "object" && v.constructor === Object);

        const isString = t === "string";

        if (!(isString || isPlainObject || isArrayOfStrings || isArrayOfObjects)) {
            report.structure.ok = false;
            report.structure.errors.push(
                `carrier["${outputField}"] must be a string, plain object, or array of strings/objects`
            );
        }
    }

    // ------------------------------------------------------------
    // 2. REPRESENTATION INVARIANTS
    // ------------------------------------------------------------

    if (func && typeof func === "object") {
        const expected = func.expected_output;

        if (expected && expected !== outputField) {
            report.representation.ok = false;
            report.representation.errors.push(
                `Function declares expected_output "${expected}" but postprocess wrote to "${outputField}"`
            );
        }
    }

    // ------------------------------------------------------------
    // 3. NON-SEMANTIC INVARIANTS
    // ------------------------------------------------------------

    const forbiddenSemanticFields = [
        "type",
        "intent",
        "meaning",
        "semantic",
        "inferred",
        "classification",
        "label"
    ];

    function checkNoSemanticFields(value, path) {
        if (!value || typeof value !== "object") return;

        for (const key of Object.keys(value)) {
            if (forbiddenSemanticFields.includes(key)) {
                report.semantics.ok = false;
                report.semantics.errors.push(
                    `${path}.${key} is a forbidden semantic field`
                );
            }
            const child = value[key];
            if (child && typeof child === "object") {
                checkNoSemanticFields(child, `${path}.${key}`);
            }
        }
    }

    if (report.structure.ok) {
        if (typeof output === "object") {
            if (Array.isArray(output)) {
                output.forEach((item, i) =>
                    checkNoSemanticFields(item, `${outputField}[${i}]`)
                );
            } else {
                checkNoSemanticFields(output, outputField);
            }
        }
    }

    // ------------------------------------------------------------
    // 4. DETERMINISM INVARIANTS
    // ------------------------------------------------------------

    const forbiddenNondeterministicFields = [
        "timestamp",
        "uuid",
        "random",
        "nonce"
    ];

    function checkNoNondeterminism(value, path) {
        if (!value || typeof value !== "object") return;

        for (const key of Object.keys(value)) {
            if (forbiddenNondeterministicFields.includes(key)) {
                report.determinism.ok = false;
                report.determinism.errors.push(
                    `${path}.${key} is a forbidden nondeterministic field`
                );
            }
            const child = value[key];
            if (child && typeof child === "object") {
                checkNoNondeterminism(child, `${path}.${key}`);
            }
        }
    }

    if (report.structure.ok) {
        if (typeof output === "object") {
            if (Array.isArray(output)) {
                output.forEach((item, i) =>
                    checkNoNondeterminism(item, `${outputField}[${i}]`)
                );
            } else {
                checkNoNondeterminism(output, outputField);
            }
        }
    }

    // ------------------------------------------------------------
    // 5. SAFETY INVARIANTS
    // ------------------------------------------------------------

    // Postprocess must not mutate anything except its own output field.
    // We cannot detect mutation here, but we can detect forbidden declarations.

    if (func && func.allow_side_effects === true) {
        report.safety.ok = false;
        report.safety.errors.push(
            "func.allow_side_effects must not be true for postprocess"
        );
    }

    // ------------------------------------------------------------
    // 6. REVERSIBILITY INVARIANTS
    // ------------------------------------------------------------

    // Postprocess must not destroy runtime output.
    // We enforce this by requiring runtime_output to still exist.

    if (func && typeof func === "object") {
        const runtimeField = func.runtime_output_field;

        if (runtimeField && carrier[runtimeField] === undefined) {
            report.reversible.ok = false;
            report.reversible.errors.push(
                `runtime output "${runtimeField}" is missing; postprocess must not destroy runtime output`
            );
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
