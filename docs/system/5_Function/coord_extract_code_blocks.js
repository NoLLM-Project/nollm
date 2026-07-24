/**
 * Behavior for coord_extract_code_blocks
 *
 * Input payload:
 * {
 *     text: "some text containing ```code``` blocks"
 * }
 *
 * Output payload:
 * {
 *     code_blocks: ["console.log('hi');", "SELECT * FROM users;", ...]
 * }
 */

export default async function coord_extract_code_blocks(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_code_blocks: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic code block extraction:
    const regex = /```(?:[\s\S]*?)```/g;

    const matches = text.match(regex) || [];

    // Clean: remove the surrounding backticks
    const cleaned = matches.map(block =>
        block.replace(/^```/, "").replace(/```$/, "").trim()
    );

    // Deduplicate
    const unique = [...new Set(cleaned)];

    return {
        code_blocks: unique
    };
}


