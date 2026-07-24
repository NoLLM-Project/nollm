/**
 * Behavior for coord_rewrite_summary
 *
 * Input payload:
 * {
 *     text: "some text that needs summarization"
 * }
 *
 * Output payload:
 * {
 *     summary: "shortened version of the text"
 * }
 */

export default async function coord_rewrite_summary(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_rewrite_summary: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const original = payload.text.trim();

    // Deterministic summary:
    // - split into sentences
    // - take the first 2 sentences OR first 30 words
    // - no semantic inference
    // - no meaning expansion
    // - no stylistic rewriting
    const sentences = original
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    let summary = "";

    if (sentences.length > 0) {
        summary = sentences.slice(0, 2).join(". ");
    } else {
        summary = original.split(/\s+/).slice(0, 30).join(" ");
    }

    summary = summary.trim();

    if (summary.length === 0) {
        summary = original;
    }

    if (!/[.!?]$/.test(summary)) {
        summary += ".";
    }

    return {
        summary
    };
}
