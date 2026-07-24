/**
 * Behavior for coord_extract_quotes
 *
 * Input payload:
 * {
 *     text: "some text containing 'quotes' or \"quotes\""
 * }
 *
 * Output payload:
 * {
 *     quotes: ["quoted text", "another quoted text", ...]
 * }
 */

export default async function coord_extract_quotes(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_quotes: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic quote extraction:
    const regex = /"([^"]+)"|'([^']+)'/g;

    const results = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        const content = match[1] || match[2];
        if (content && content.trim().length > 0) {
            results.push(content.trim());
        }
    }

    const unique = [...new Set(results)];

    return {
        quotes: unique
    };
}

