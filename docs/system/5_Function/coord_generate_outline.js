/**
 * Behavior for coord_generate_outline
 *
 * Input payload:
 * {
 *     items: ["Introduction", "Methods", "Results"]
 * }
 *
 * Output payload:
 * {
 *     result: "1. Introduction\n2. Methods\n3. Results"
 * }
 */

export default async function coord_generate_outline(args) {
    const { payload } = args || {};

    if (!payload || !Array.isArray(payload.items)) {
        return {
            error: "coord_generate_outline: missing or invalid 'items' field",
            input: {
                rawItems: payload?.items ?? null
            }
        };
    }

    // Deterministic numbering: 1., 2., 3., ...
    const lines = payload.items.map((item, index) => {
        return `${index + 1}. ${String(item)}`;
    });

    return {
        result: lines.join("\n")
    };
}
