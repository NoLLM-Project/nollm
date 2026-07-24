/**
 * Behavior for coord_extract_paragraphs
 *
 * Input payload:
 * {
 *     text: "some text containing multiple paragraphs"
 * }
 *
 * Output payload:
 * {
 *     paragraphs: ["Paragraph 1...", "Paragraph 2...", ...]
 * }
 */

export default async function coord_extract_paragraphs(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_paragraphs: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic paragraph extraction:
    const raw = text.split(/\n\s*\n+/);

    const cleaned = raw
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const unique = [...new Set(cleaned)];

    return {
        paragraphs: unique
    };
}

