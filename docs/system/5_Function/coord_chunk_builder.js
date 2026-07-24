/**
 * coord_chunk_builder.js
 *
 * Real structural logic:
 * - identify head token
 * - identify modifiers
 * - produce stable span
 *
 * This room is a pure structural engine.
 * It does NOT read workflowContext.
 * It only operates on the chunks/atoms passed in.
 */

export default async function coord_chunk_builder(input) {
    // Normalize input: caller may pass atoms instead of chunks
    const { chunks = [] } = input || {};

    // Ensure each chunk has a token list
    const normalized = chunks.map((chk, idx) => {
        // If caller passed atoms directly, wrap them
        if (!chk.tokens && chk.surface) {
            return {
                id: chk.id || `CHK_${idx}`,
                type: chk.type || "unknown",
                tokens: [chk],     // treat atom as a 1-token chunk
            };
        }

        return chk;
    });

    const built = normalized.map((chk, idx) => {
        const tokens = chk.tokens || [];

        // --- HEAD SELECTION ---
        let head = null;

        if (chk.type === "nominal") {
            head = tokens.filter(t => t.pos === "NOUN").slice(-1)[0] || tokens[0];
        } else if (chk.type === "verbal") {
            head = tokens.filter(t => t.pos === "VERB")[0] || tokens[0];
        } else if (chk.type === "prepositional") {
            head = tokens[0];
        } else {
            head = tokens[0];
        }

        // --- MODIFIERS ---
        const modifiers = tokens.filter(t => t !== head);

        return {
            id: `BCHK_${idx}`,
            source_chunk_id: chk.id || null,
            structure: {
                head,
                modifiers,
                span: tokens
            }
        };
    });

    return { built };
}
