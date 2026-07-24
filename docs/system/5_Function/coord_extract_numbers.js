/**
 * Behavior for coord_extract_numbers
 *
 * Input payload:
 * {
 *     text: "some text containing numbers"
 * }
 *
 * Output payload:
 * {
 *     numbers: ["42", "3.14", "1000", ...]
 * }
 */

export default async function coord_extract_numbers(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_numbers: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic number extraction:
    // - integers (42)
    // - decimals (3.14)
    // - comma-formatted numbers (1,234)
    // - negative numbers (-12)
    const regex = /\b-?\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g;

    const matches = text.match(regex) || [];

    // Normalize: remove commas for consistency
    const cleaned = matches.map(n => n.replace(/,/g, "").trim());

    // Deduplicate
    const unique = [...new Set(cleaned)];

    return {
        numbers: unique
    };
}

