/**
 * Behavior for coord_rewrite_tone
 *
 * Input payload:
 * {
 *     text: "hello world",
 *     tone: "uppercase"   // or "lowercase", "titlecase", "identity"
 * }
 *
 * Output payload:
 * {
 *     result: "HELLO WORLD"
 * }
 */

export default async function coord_rewrite_tone(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_rewrite_tone: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    if (!payload.tone || typeof payload.tone !== "string") {
        return {
            error: "coord_rewrite_tone: missing or invalid 'tone' field",
            input: {
                rawTone: payload?.tone ?? null
            }
        };
    }

    const text = payload.text;
    const tone = payload.tone.toLowerCase();

    let result;

    switch (tone) {
        case "uppercase":
            result = text.toUpperCase();
            break;

        case "lowercase":
            result = text.toLowerCase();
            break;

        case "titlecase":
            result = text.replace(/\w\S*/g, word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            );
            break;

        case "identity":
            result = text;
            break;

        default:
            return {
                error: `coord_rewrite_tone: unsupported tone '${tone}'`,
                supported_tones: ["uppercase", "lowercase", "titlecase", "identity"],
                input: {
                    rawTone: payload.tone
                }
            };
    }

    return { result };
}
