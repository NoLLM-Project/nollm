/**
 * Behavior for coord_uppercase_text
 *
 * Input payload:
 * {
 *     text: "Hello world"
 * }
 *
 * Output payload:
 * {
 *     result: "HELLO WORLD"
 * }
 */

export default async function coord_uppercase_text(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_uppercase_text: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.toUpperCase();

    return {
        result: text
    };
}

