/**
 * Behavior for coord_generate_bullets
 *
 * Input payload:
 * {
 *     items: ["apple", "banana", "carrot"]
 * }
 *
 * Output payload:
 * {
 *     result: "- apple\n- banana\n- carrot"
 * }
 */

export default async function coord_generate_bullets(args) {
    const { payload } = args || {};

    if (!payload || !Array.isArray(payload.items)) {
        return {
            error: "coord_generate_bullets: missing or invalid 'items' field",
            input: {
                rawItems: payload?.items ?? null
            }
        };
    }

    // Deterministic bullet formatting
    const lines = payload.items.map(item => `- ${String(item)}`);

    return {
        result: lines.join("\n")
    };
}
