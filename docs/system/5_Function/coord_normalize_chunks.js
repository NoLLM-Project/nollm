/**
 * coord_normalize_chunks.js
 *
 * Structural chunk normalization for NoLLM.
 * This room performs minimal, safe normalization:
 * - preserves chunk order
 * - preserves spans
 * - merges adjacent chunks only if explicitly marked mergeable
 * - never generates language
 * - never interprets meaning
 */

export default async function coord_normalize_chunks(args) {
    const { payload, workflowContext } = args || {};

    // ⭐ PATCH: Prefer preprocess tokens, fallback to atomize tokens
    const tokens =
        payload?.tokens ??
        workflowContext["coord_tokenize_text"]?.result ??               // ← canonical preprocess tokens
        workflowContext["coord_tokenize_for_atoms"]?.payload?.result;   // ← fallback only

    // ⭐ Prefer atoms from phrase matching, fallback to resolve_atoms
    const atoms =
        payload?.atoms ??
        workflowContext["coord_match_phrases"]?.payload?.atoms ??
        workflowContext["coord_resolve_atoms"]?.payload?.atoms;

    // ⭐ Prefer chunks from match_chunks, fallback to chunk_builder
    const chunks =
        payload?.chunks ??
        workflowContext["coord_match_chunks"]?.payload?.chunks ??
        workflowContext["coord_chunk_builder"]?.built;

    if (!Array.isArray(tokens) || !Array.isArray(atoms) || !Array.isArray(chunks)) {
        return {
            error: "coord_normalize_chunks: missing or invalid 'tokens', 'atoms', or 'chunks'",
            input: payload
        };
    }

    // Minimal structural normalization
    const normalized = [];
    let i = 0;

    while (i < chunks.length) {
        const current = chunks[i];

        // If the chunk engine marks a chunk as mergeable with the next one,
        // we merge spans and combine their atom lists.
        if (
            i + 1 < chunks.length &&
            current.mergeable === true &&
            chunks[i + 1].mergeable === true
        ) {
            const next = chunks[i + 1];

            const merged = {
                id: `${current.id}_MERGED_${next.id}`,
                type: current.type,
                subtype: current.subtype,
                atoms: [...current.atoms, ...next.atoms],
                span: [current.span[0], next.span[1]],
                mergeable: false
            };

            normalized.push(merged);
            i += 2;
            continue;
        }

        // Otherwise keep chunk as-is
        normalized.push(current);
        i++;
    }

    return {
        payload: {
            tokens,
            atoms,
            chunks: normalized,
            __log: "coord_normalize_chunks"
        }
    };
}
