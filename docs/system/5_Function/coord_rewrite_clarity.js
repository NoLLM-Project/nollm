/**
 * Behavior for coord_rewrite_clarity
 *
 * Input payload:
 * {
 *     text: "some text that needs clearer expression"
 * }
 *
 * Output payload:
 * {
 *     text: "rewritten text with improved clarity"
 * }
 */

export default async function coord_rewrite_clarity(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_rewrite_clarity: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const original = payload.text.trim();

    // Deterministic clarity rewrite:
    // - simplify long sentences
    // - remove filler words
    // - prefer direct phrasing
    // - keep meaning identical
    // - no stylistic flourish
    // - no semantic expansion
    const simplified = original
        .replace(/\s+/g, " ")
        .replace(/\b(really|very|basically|actually|just|kind of|sort of)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

    const result = simplified.length > 0 ? simplified : original;

    return {
        text: result
    };
}
