/**
 * Behavior for coord_generate_list
 *
 * Input payload:
 * {
 *     text: "some text that should become a list"
 * }
 *
 * Output payload:
 * {
 *     list: ["item1", "item2", ...]
 * }
 */

export default async function coord_generate_list(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_generate_list: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.trim();

    // Deterministic list generation:
    // - split on newlines OR punctuation
    // - trim each item
    // - filter out empty entries
    const rawItems = text
        .split(/[\n•\-–—,;]+/g)   // common list separators
        .map(item => item.trim())
        .filter(item => item.length > 0);

    return {
        list: rawItems
    };
}
