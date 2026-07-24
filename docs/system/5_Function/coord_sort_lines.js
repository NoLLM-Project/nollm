/**
 * Behavior for coord_sort_lines
 *
 * Input payload:
 * {
 *     text: "banana\napple\ncarrot"
 * }
 *
 * Output payload:
 * {
 *     result: "apple\nbanana\ncarrot"
 * }
 */

export default async function coord_sort_lines(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_sort_lines: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Split into lines
    const lines = text.split(/\r?\n/);

    // Sort lexicographically
    const sorted = lines.sort((a, b) => a.localeCompare(b));

    // Join back together
    const result = sorted.join("\n");

    return {
        result
    };
}
