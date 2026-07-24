/**
 * coord_segment_clauses.js
 *
 * Builds CLAUSE objects from CHUNK objects using the real clause engine.
 * Pure structural decoding. No semantics. No language generation.
 */

import coord_clause_builder from "./coord_clause_builder.js";

export default async function coord_segment_clauses(args) {
    const { payload, workflowContext } = args || {};

    // ⭐ PATCH: Prefer preprocess tokens, fallback to atomize tokens
    const tokens =
        payload?.tokens ??
        workflowContext["coord_tokenize_text"]?.result ??               // ← canonical preprocess tokens
        workflowContext["coord_tokenize_for_atoms"]?.payload?.result;   // ← fallback only

    // ⭐ Prefer chunks from normalize_chunks, fallback to match_chunks
    const chunks =
        payload?.chunks ??
        workflowContext["coord_normalize_chunks"]?.payload?.chunks ??
        workflowContext["coord_match_chunks"]?.payload?.chunks ??
        workflowContext["coord_chunk_builder"]?.built;

    // ⭐ Prefer atoms from phrase matching, fallback to resolve_atoms
    const atoms =
        payload?.atoms ??
        workflowContext["coord_match_phrases"]?.payload?.atoms ??
        workflowContext["coord_resolve_atoms"]?.payload?.atoms;

    if (!Array.isArray(tokens) || !Array.isArray(chunks)) {
        return {
            error: "coord_segment_clauses: missing or invalid 'tokens' or 'chunks'",
            input: payload
        };
    }

    // Call the real clause builder (pure structural grouping)
    const built = await coord_clause_builder({
        clauses: [{ id: "CLS1", chunks }]
    });

    return {
        payload: {
            tokens,
            atoms,
            chunks,
            clauses: [built.built],
            __log: "coord_segment_clauses"
        }
    };
}
