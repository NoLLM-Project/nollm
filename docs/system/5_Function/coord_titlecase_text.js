/**
 * Behavior for coord_titlecase_text
 *
 * Input payload:
 * {
 *     text: "hello world from the farm"
 * }
 *
 * Output payload:
 * {
 *     result: "Hello World From The Farm"
 * }
 */

export default async function coord_titlecase_text(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_titlecase_text: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Title-case each word deterministically
    const result = text.replace(/\w\S*/g, word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return {
        result
    };
}

