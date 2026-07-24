/**
 * coord_normalize_clauses.js
 *
 * Structural clause normalization for NoLLM.
 * This room performs minimal, safe normalization:
 * - preserves clause order
 * - preserves spans
 * - merges adjacent clauses only if explicitly marked mergeable
 * - never generates language
 * - never interprets meaning
 */

export default async function coord_normalize_clauses(args) {
    const { payload, workflowContext } = args || {};

    // ⭐ Deterministic fallback: prefer payload, else read workflowContext
    const tokens =
        payload?.tokens ??
        workflowContext["coord_tokenize_for_atoms"]?.payload?.result;

    const chunks =
        payload?.chunks ??
        workflowContext["coord_normalize_chunks"]?.payload?.chunks ??
        workflowContext["coord_match_chunks"]?.payload?.chunks ??
        workflowContext["coord_chunk_builder"]?.built;

    const clauses =
        payload?.clauses ??
        workflowContext["coord_segment_clauses"]?.payload?.clauses ??
        workflowContext["coord_clause_builder"]?.built;

    if (!Array.isArray(tokens) || !Array.isArray(chunks) || !Array.isArray(clauses)) {
        return {
            error: "coord_normalize_clauses: missing or invalid 'tokens', 'chunks', or 'clauses'",
            input: payload
        };
    }

    // Minimal structural normalization
    const normalized = [];
    let i = 0;

    while (i < clauses.length) {
        const current = clauses[i];

        // If the clause engine marks a clause as mergeable with the next one,
        // we merge spans and combine their chunk lists.
        if (
            i + 1 < clauses.length &&
            current.mergeable === true &&
            clauses[i + 1].mergeable === true
        ) {
            const next = clauses[i + 1];

            const merged = {
                id: `${current.id}_MERGED_${next.id}`,
                chunks: [...current.chunks, ...next.chunks],
                span: [current.span[0], next.span[1]],
                mergeable: false
            };

            normalized.push(merged);
            i += 2;
            continue;
        }

        // Otherwise keep clause as-is
        normalized.push(current);
        i++;
    }

    return {
        payload: {
            tokens,
            chunks,
            clauses: normalized,
            __log: "coord_normalize_clauses"
        }
    };
}
