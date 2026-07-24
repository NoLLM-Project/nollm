/**
 * Behavior for coord_extract_mentions
 *
 * Input payload:
 * {
 *     text: "some text containing @mentions"
 * }
 *
 * Output payload:
 * {
 *     mentions: ["@user1", "@someone", ...]
 * }
 */

export default async function coord_extract_mentions(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_mentions: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic mention extraction:
    const regex = /@[a-zA-Z0-9_]+/g;

    const matches = text.match(regex) || [];

    // Deduplicate
    const unique = [...new Set(matches.map(m => m.trim()))];

    return {
        mentions: unique
    };
}
