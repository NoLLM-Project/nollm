/**
 * Behavior for coord_slugify_text
 *
 * Input payload:
 * {
 *     text: "Hello, World! This is a Test."
 * }
 *
 * Output payload:
 * {
 *     result: "hello-world-this-is-a-test"
 * }
 */

export default async function coord_slugify_text(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_slugify_text: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    let text = payload.text;

    // 1. Lowercase
    text = text.toLowerCase();

    // 2. Replace all non-alphanumeric characters with spaces
    text = text.replace(/[^a-z0-9]+/g, " ");

    // 3. Collapse whitespace to single hyphens
    text = text.trim().replace(/\s+/g, "-");

    // 4. Remove leading/trailing hyphens
    text = text.replace(/^-+|-+$/g, "");

    return {
        result: text
    };
}

