/**
 * Behavior for coord_generate_paragraph
 *
 * Input payload:
 * {
 *     items: ["This is sentence one.", "This is sentence two."]
 * }
 *
 * Output payload:
 * {
 *     result: "This is sentence one. This is sentence two."
 * }
 */

export default async function coord_generate_paragraph(args) {
    const { payload } = args || {};

    if (!payload || !Array.isArray(payload.items)) {
        return {
            error: "coord_generate_paragraph: missing or invalid 'items' field",
            input: {
                rawItems: payload?.items ?? null
            }
        };
    }

    // Coerce all items to strings deterministically
    const parts = payload.items.map(item => String(item));

    // Join with a single space
    const result = parts.join(" ");

    return {
        result
    };
}
