// system/5_Function/validators/run_all_atomize_invariants.js

export function runAllAtomizeInvariants(carrier) {

    const report = {
        atomicity:     { ok: true, errors: [] },
        structure:     { ok: true, errors: [] },
        semantics:     { ok: true, errors: [] },
        determinism:   { ok: true, errors: [] },
        linguistic:    { ok: true, errors: [] },
        overall_ok:    true
    };

    const atoms = carrier?.atoms;
    const tokens = carrier?.tokens;
    const chunks = carrier?.chunks;
    const clauses = carrier?.clauses;
    const sentence = carrier?.sentence;

    // ------------------------------------------------------------
    // 1. ATOMICITY INVARIANTS
    // ------------------------------------------------------------

    // atoms must be an array of primitive, non-semantic units
    if (!Array.isArray(atoms)) {
        report.atomicity.ok = false;
        report.atomicity.errors.push("carrier.atoms must be an array");
    } else {
        for (let i = 0; i < atoms.length; i++) {
            const a = atoms[i];
            if (typeof a !== "string") {
                report.atomicity.ok = false;
                report.atomicity.errors.push(`atoms[${i}] must be a string`);
            }
        }
    }

    // ------------------------------------------------------------
    // 2. STRUCTURE INVARIANTS
    // ------------------------------------------------------------

    if (!Array.isArray(tokens)) {
        report.structure.ok = false;
        report.structure.errors.push("carrier.tokens must be an array");
    }

    if (!Array.isArray(chunks)) {
        report.structure.ok = false;
        report.structure.errors.push("carrier.chunks must be an array");
    }

    if (!Array.isArray(clauses)) {
        report.structure.ok = false;
        report.structure.errors.push("carrier.clauses must be an array");
    }

    if (typeof sentence !== "object" || sentence === null) {
        report.structure.ok = false;
        report.structure.errors.push("carrier.sentence must be a non-null object");
    }

    // ------------------------------------------------------------
    // 3. SEMANTIC-NEUTRALITY INVARIANTS
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
                report.semantics.errors.push(`${path}.${key} is a forbidden semantic field`);
            }
            const child = value[key];
            if (child && typeof child === "object") {
                checkNoSemanticFields(child, `${path}.${key}`);
            }
        }
    }

    if (Array.isArray(chunks)) {
        chunks.forEach((c, i) => checkNoSemanticFields(c, `chunks[${i}]`));
    }
    if (Array.isArray(clauses)) {
        clauses.forEach((c, i) => checkNoSemanticFields(c, `clauses[${i}]`));
    }
    if (sentence && typeof sentence === "object") {
        checkNoSemanticFields(sentence, "sentence");
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
                report.determinism.errors.push(`${path}.${key} is a forbidden nondeterministic field`);
            }
            const child = value[key];
            if (child && typeof child === "object") {
                checkNoNondeterminism(child, `${path}.${key}`);
            }
        }
    }

    if (Array.isArray(chunks)) {
        chunks.forEach((c, i) => checkNoNondeterminism(c, `chunks[${i}]`));
    }
    if (Array.isArray(clauses)) {
        clauses.forEach((c, i) => checkNoNondeterminism(c, `clauses[${i}]`));
    }
    if (sentence && typeof sentence === "object") {
        checkNoNondeterminism(sentence, "sentence");
    }

    // ------------------------------------------------------------
    // 5. LINGUISTIC-FORM INVARIANTS
    // ------------------------------------------------------------

    // tokens must be strings
    if (Array.isArray(tokens)) {
        for (let i = 0; i < tokens.length; i++) {
            if (typeof tokens[i] !== "string") {
                report.linguistic.ok = false;
                report.linguistic.errors.push(`tokens[${i}] must be a string`);
            }
        }
    }

    // chunks must be arrays of strings
    if (Array.isArray(chunks)) {
        for (let i = 0; i < chunks.length; i++) {
            const ch = chunks[i];
            if (!Array.isArray(ch) || !ch.every(t => typeof t === "string")) {
                report.linguistic.ok = false;
                report.linguistic.errors.push(`chunks[${i}] must be an array of strings`);
            }
        }
    }

    // clauses must be arrays of chunks
    if (Array.isArray(clauses)) {
        for (let i = 0; i < clauses.length; i++) {
            const cl = clauses[i];
            if (!Array.isArray(cl)) {
                report.linguistic.ok = false;
                report.linguistic.errors.push(`clauses[${i}] must be an array`);
            }
        }
    }

    // sentence must contain structural fields but no semantics
    if (sentence && typeof sentence === "object") {
        if (!Array.isArray(sentence.clauses)) {
            report.linguistic.ok = false;
            report.linguistic.errors.push("sentence.clauses must be an array");
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
