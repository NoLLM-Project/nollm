/**
 * Behavior for coord_extract_emails
 *
 * Input payload:
 * {
 *     text: "some text containing emails"
 * }
 *
 * Output payload:
 * {
 *     emails: ["a@example.com", "b@test.org"]
 * }
 */

export default function coord_extract_emails(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_emails: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic email extraction:
    // - match standard email patterns
    // - dedupe
    const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g) || [];

    const unique = [...new Set(matches)];

    return {
        emails: unique
    };
}
