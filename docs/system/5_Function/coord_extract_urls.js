/**
 * Behavior for coord_extract_urls
 *
 * Input payload:
 * {
 *     text: "some text containing URLs"
 * }
 *
 * Output payload:
 * {
 *     urls: ["https://example.com", "http://test.org/page", ...]
 * }
 */

export default async function coord_extract_urls(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_urls: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic URL extraction:
    // Matches:
    // - http://example.com
    // - https://example.com/path
    // - www.example.com
    // - example.com (basic domain)
    const regex =
        /\b((https?:\/\/|www\.)[^\s/$.?#].[^\s]*)\b/gi;

    const matches = text.match(regex) || [];

    // Normalize: ensure all URLs are trimmed
    const cleaned = matches.map(u => u.trim());

    // Deduplicate
    const unique = [...new Set(cleaned)];

    return {
        urls: unique
    };
}

