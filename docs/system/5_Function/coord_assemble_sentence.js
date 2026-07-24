/**
 * coord_assemble_sentence.js
 *
 * Assembles the final SENTENCE object from tokens, atoms, chunks, and clauses.
 * Pure structural packaging. No semantics. No language generation.
 */

export default async function coord_assemble_sentence(args) {
    const { payload, workflowContext } = args || {};

    // ⭐ PATCH: Prefer preprocess tokens, fallback to atomize tokens
    const tokens =
        payload?.tokens ??
        workflowContext["coord_tokenize_text"]?.result ??               // ← canonical preprocess tokens
        workflowContext["coord_tokenize_for_atoms"]?.payload?.result;   // ← fallback only

    const atoms =
        payload?.atoms ??
        workflowContext["coord_match_phrases"]?.payload?.atoms ??
        workflowContext["coord_resolve_atoms"]?.payload?.atoms;

    const chunks =
        payload?.chunks ??
        workflowContext["coord_normalize_chunks"]?.payload?.chunks ??
        workflowContext["coord_match_chunks"]?.payload?.chunks ??
        workflowContext["coord_chunk_builder"]?.built;

    const clauses =
        payload?.clauses ??
        workflowContext["coord_normalize_clauses"]?.payload?.clauses ??
        workflowContext["coord_segment_clauses"]?.payload?.clauses ??
        workflowContext["coord_clause_builder"]?.built;

    if (
        !Array.isArray(tokens) ||
        !Array.isArray(atoms) ||
        !Array.isArray(chunks) ||
        !Array.isArray(clauses)
    ) {
        return {
            error:
                "coord_assemble_sentence: missing or invalid 'tokens', 'atoms', 'chunks', or 'clauses'",
            input: payload
        };
    }

    // ⭐ Deterministic ID
    const sentenceId = `SENT_${String(tokens.length).padStart(10, "0")}`;

    const sentence = {
        id: sentenceId,
        tokens,
        atoms,
        chunks,
        clauses
    };

    return {
        payload: {
            sentence,
            __log: "coord_assemble_sentence"
        }
    };
}
