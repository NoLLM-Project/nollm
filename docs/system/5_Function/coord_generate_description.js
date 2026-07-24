/**
 * Behavior for coord_generate_description
 *
 * Input payload:
 * {
 *     items: ["Line one", "Line two", "Line three"]
 * }
 *
 * Output payload:
 * {
 *     result: "Line one\nLine two\nLine three"
 * }
 */

export default async function coord_generate_description(args) {
    const { payload } = args || {};

    if (!payload || !Array.isArray(payload.items)) {
        return {
            error: "coord_generate_description: missing or invalid 'items' field",
            input: {
                rawItems: payload?.items ?? null
            }
        };
    }

    // Coerce all items to strings deterministically
    const lines = payload.items.map(item => String(item));

    return {
        result: lines.join("\n")
    };
}
