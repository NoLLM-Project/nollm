/**
 * Behavior for coord_rewrite_text_literal
 *
 * Input payload:
 * {
 *     text: "Some text exactly as provided."
 * }
 *
 * Output payload:
 * {
 *     result: "Some text exactly as provided."
 * }
 */

export default async function coord_rewrite_text_literal(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_rewrite_text_literal: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    // Deterministic identity rewrite
    return {
        result: payload.text
    };
}
