/**
 * Behavior for coord_extract_keywords
 *
 * Input payload:
 * {
 *     text: "some text to analyze"
 * }
 *
 * Output payload:
 * {
 *     keywords: ["list", "of", "keywords"]
 * }
 */

export default async function coord_extract_keywords(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_keywords: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Simple keyword extraction:
    // - lowercase
    // - split on non-alphanumeric
    // - filter out short words
    // - dedupe
    const words = text
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .filter(w => w.length > 3);

    const unique = [...new Set(words)];

    return {
        keywords: unique
    };
}

