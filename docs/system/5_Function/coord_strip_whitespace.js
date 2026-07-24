/**
 * Behavior for coord_strip_whitespace
 *
 * Input payload:
 * {
 *     text: "   some text with padding   "
 * }
 *
 * Output payload:
 * {
 *     result: "some text with padding"
 * }
 */

export default async function coord_strip_whitespace(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_strip_whitespace: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.trim();

    return {
        result: text
    };
}

