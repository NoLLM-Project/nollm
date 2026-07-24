/**
 * Behavior for coord_detokenize_text
 *
 * Input payload:
 * {
 *     tokens: ["hello", "world", "this", "is", "fine"]
 * }
 *
 * Output payload:
 * {
 *     result: "hello world this is fine"
 * }
 */

export default async function coord_detokenize_text(args) {
    const { payload } = args || {};

    // PATCH: convert missing/invalid tokens from "fail" → "noop"
    if (!payload || !Array.isArray(payload.tokens)) {
        return {
            status: "noop",
            reason: "coord_detokenize_text: no tokens to detokenize",
            output: null
        };
    }

    // Ensure all elements are strings
    const safeTokens = payload.tokens.map(t =>
        typeof t === "string" ? t : String(t)
    );

    const result = safeTokens.join(" ");

    return {
        status: "ok",
        result
    };
}
