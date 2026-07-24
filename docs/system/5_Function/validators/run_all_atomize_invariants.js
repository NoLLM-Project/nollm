// system/5_Function/validators/run_all_atomize_invariants.js

export async function runAllAtomizeInvariants(workflowContext) {

    if (!workflowContext || typeof workflowContext !== "object") {
        return {
            registry: { ok: true },
            atomicity: { ok: false, errors: ["workflowContext missing or invalid"] },
            structure: { ok: true, errors: [] },
            semantics: { ok: true, errors: [] },
            determinism: { ok: true, errors: [] },
            linguistic: { ok: true, errors: [] },
            overall_ok: false
        };
    }

    const report = {
        registry: { ok: true },
        atomicity: { ok: true, errors: [] },
        structure: { ok: true, errors: [] },
        semantics: { ok: true, errors: [] },
        determinism: { ok: true, errors: [] },
        linguistic: { ok: true, errors: [] },
        overall_ok: true
    };

    // ⭐ PATCHED SOURCES
    const tokens =
        workflowContext["coord_tokenize_text"]?.result ??
        workflowContext["coord_tokenize_for_atoms"]?.payload?.result;

    const atoms =
        workflowContext["coord_match_phrases"]?.payload?.atoms ??
        workflowContext["coord_resolve_atoms"]?.payload?.atoms;

    const chunks =
        workflowContext["coord_normalize_chunks"]?.payload?.chunks ??
        workflowContext["coord_match_chunks"]?.payload?.chunks ??
        (workflowContext["coord_chunk_builder"]?.built ?? undefined);

    const clauses =
        workflowContext["coord_segment_clauses"]?.payload?.clauses ??
        (workflowContext["coord_clause_builder"]?.built
            ? [workflowContext["coord_clause_builder"].built]
            : undefined);

    const sentence =
        workflowContext["coord_assemble_sentence"]?.payload?.sentence;

    // ⭐ ATOMICITY
    if (!Array.isArray(atoms)) {
        report.atomicity.ok = false;
        report.atomicity.errors.push("atoms must be an array");
    } else {
        for (let i = 0; i < atoms.length; i++) {
            if (typeof atoms[i] !== "object") {
                report.atomicity.ok = false;
                report.atomicity.errors.push(`atoms[${i}] must be an object`);
            }
        }
    }

    // ⭐ STRUCTURE
    if (!Array.isArray(tokens)) {
        report.structure.ok = false;
        report.structure.errors.push("tokens must be an array");
    }
    if (!Array.isArray(chunks)) {
        report.structure.ok = false;
        report.structure.errors.push("chunks must be an array");
    }
    if (!Array.isArray(clauses)) {
        report.structure.ok = false;
        report.structure.errors.push("clauses must be an array");
    }
    if (typeof sentence !== "object" || sentence === null) {
        report.structure.ok = false;
        report.structure.errors.push("sentence must be a non-null object");
    }

    // ⭐ SEMANTICS
    const forbiddenSemanticFields = [
        "type", "intent", "meaning", "semantic",
        "inferred", "classification", "label"
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

    // ⭐ DETERMINISM
    const forbiddenNondeterministicFields = [
        "timestamp", "uuid", "random", "nonce"
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

    // ⭐ LINGUISTIC
    if (Array.isArray(tokens)) {
        for (let i = 0; i < tokens.length; i++) {
            if (typeof tokens[i] !== "string") {
                report.linguistic.ok = false;
                report.linguistic.errors.push(`tokens[${i}] must be a string`);
            }
        }
    }

    if (Array.isArray(chunks)) {
        for (let i = 0; i < chunks.length; i++) {
            if (typeof chunks[i] !== "object") {
                report.linguistic.ok = false;
                report.linguistic.errors.push(`chunks[${i}] must be an object`);
            }
        }
    }

    if (Array.isArray(clauses)) {
        for (let i = 0; i < clauses.length; i++) {
            if (typeof clauses[i] !== "object") {
                report.linguistic.ok = false;
                report.linguistic.errors.push(`clauses[${i}] must be an object`);
            }
        }
    }

    if (sentence && typeof sentence === "object") {
        if (!Array.isArray(sentence.clauses)) {
            report.linguistic.ok = false;
            report.linguistic.errors.push("sentence.clauses must be an array");
        }
    }

    // ⭐ OVERALL
    const atomize_ok = Object.values(report)
        .filter(section => typeof section === "object" && "ok" in section)
        .every(section => section.ok);

    report.overall_ok = atomize_ok;

    return report;
}
