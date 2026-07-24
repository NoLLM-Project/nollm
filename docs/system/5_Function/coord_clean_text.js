/**
 * Behavior for coord_clean_text
 *
 * Input payload:
 * {
 *     text: "Some   text <b>with</b>\n weird   spacing\tand \u0007control chars"
 * }
 *
 * Output payload:
 * {
 *     result: "Some text with weird spacing and control chars"
 * }
 */

export default async function coord_clean_text(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_clean_text: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    let text = payload.text;

    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    text = text.replace(/<[^>]*>/g, "");
    text = text.replace(/\s+/g, " ");
    text = text.trim();

    return {
        transition: "exit_room",
        payload: {
            result: text,
            __log: "coord_clean_text"
        }
    };
}


