/**
 * Behavior for coord_tokenize_text
 *
 * Input payload:
 * {
 *     text: "hello   world\nthis is\tfine"
 * }
 *
 * Output payload:
 * {
 *     result: ["hello", "world", "this", "is", "fine"]
 * }
 */

export default async function coord_tokenize_text(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_tokenize_text: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Split on any whitespace sequence
    const tokens = text.trim().length === 0
        ? []
        : text.trim().split(/\s+/);

    return {
        result: tokens
    };
}

