/**
 * Behavior for coord_generate_title
 *
 * Input payload:
 * {
 *     text: "some long text that needs a title"
 * }
 *
 * Output payload:
 * {
 *     title: "A concise generated title"
 * }
 */

export default async function coord_generate_title(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_generate_title: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.trim();

    // Basic deterministic title generation:
    // - take the first sentence or first ~8 words
    // - capitalize first letter
    // - remove trailing punctuation
    let candidate = text
        .split(/[.!?]/)[0]        // first sentence
        .split(/\s+/)             // words
        .slice(0, 8)              // first 8 words
        .join(" ")
        .trim();

    if (candidate.length === 0) {
        candidate = "Untitled";
    }

    // Capitalize first letter
    candidate = candidate.charAt(0).toUpperCase() + candidate.slice(1);

    // Remove trailing punctuation
    candidate = candidate.replace(/[.,;:!?]+$/, "");

    return {
        title: candidate
    };
}
