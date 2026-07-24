/**
 * Behavior for coord_normalize_whitespace
 *
 * Input payload:
 * {
 *     text: "Some   text\nwith   mixed\twhitespace"
 * }
 *
 * Output payload:
 * {
 *     result: "Some text with mixed whitespace"
 * }
 */

export default async function coord_normalize_whitespace(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_normalize_whitespace: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    let text = payload.text;

    // Replace all whitespace sequences with a single space
    text = text.replace(/\s+/g, " ");

    // Trim leading/trailing whitespace
    text = text.trim();

    return {
        result: text
    };
}

