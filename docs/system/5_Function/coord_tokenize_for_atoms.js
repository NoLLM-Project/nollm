/**
 * Behavior for coord_tokenize_for_atoms
 *
 * Input payload:
 * {
 *     text: "some   input\ntext"
 * }
 *
 * Output payload:
 * {
 *     result: ["some", "input", "text"]
 * }
 */

export default async function coord_tokenize_for_atoms(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_tokenize_for_atoms: missing or invalid 'text' field",
            input: payload
        };
    }

    const text = payload.text.trim();

    const tokens = text.length === 0
        ? []
        : text.split(/\s+/);

    return {
        payload: {
            result: tokens,
            __log: "coord_tokenize_for_atoms"
        }
    };
}

