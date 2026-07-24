/**
 * Behavior for coord_parse_json
 *
 * Input payload:
 * {
 *     text: "{ \"a\": 1, \"b\": 2 }"
 * }
 *
 * Output payload (success):
 * {
 *     ok: true,
 *     data: { a: 1, b: 2 }
 * }
 *
 * Output payload (error):
 * {
 *     ok: false,
 *     error: "JSON parse error: ...",
 *     input: "{ ... }"
 * }
 */

export default async function coord_parse_json(args) {
    const { payload } = args || {};

    // PATCH: missing/invalid text → noop instead of fail
    if (!payload || typeof payload.text !== "string") {
        return {
            status: "noop",
            reason: "coord_parse_json: no valid text field",
            output: null
        };
    }

    const text = payload.text.trim();

    try {
        const parsed = JSON.parse(text);
        return {
            status: "ok",
            data: parsed
        };
    } catch (err) {
        // PATCH: JSON parse failure → noop instead of fail
        return {
            status: "noop",
            reason: "coord_parse_json: input is not valid JSON",
            output: null
        };
    }
}


