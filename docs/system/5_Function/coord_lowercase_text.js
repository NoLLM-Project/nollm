/**
 * Behavior for coord_lowercase_text
 *
 * Input payload:
 * {
 *     text: "Hello WORLD"
 * }
 *
 * Output payload:
 * {
 *     result: "hello world"
 * }
 */

export default async function coord_lowercase_text(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_lowercase_text: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.toLowerCase();

    return {
        result: text
    };
}

