/**
 * coord_match_chunks.js
 *
 * Builds CHUNK objects from ATOM objects using the real chunk engine.
 * Pure structural decoding. No semantics. No language generation.
 */

import coord_chunk_builder from "./coord_chunk_builder.js";

export default async function coord_match_chunks(args) {
    const { payload, workflowContext } = args || {};

    // ⭐ PATCH: Prefer preprocess tokens, fallback to atomize tokens
    const tokens =
        payload?.tokens ??
        workflowContext["coord_tokenize_text"]?.result ??               // ← canonical preprocess tokens
        workflowContext["coord_tokenize_for_atoms"]?.payload?.result;   // ← fallback only

    // ⭐ PATCH: Prefer atoms from phrase matching, fallback to resolve_atoms
    const atoms =
        payload?.atoms ??
        workflowContext["coord_match_phrases"]?.payload?.atoms ??
        workflowContext["coord_resolve_atoms"]?.payload?.atoms;

    if (!Array.isArray(tokens) || !Array.isArray(atoms)) {
        return {
            error: "coord_match_chunks: missing or invalid 'tokens' or 'atoms'",
            input: payload
        };
    }

    // Call the real chunk builder (pure structural grouping)
    const built = await coord_chunk_builder({ chunks: atoms });

    return {
        payload: {
            tokens,
            atoms,
            chunks: built.built,
            __log: "coord_match_chunks"
        }
    };
}
