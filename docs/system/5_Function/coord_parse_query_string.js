/**
 * Behavior for coord_parse_query_string
 *
 * Input payload:
 * {
 *     text: "a=1&b=2&c=hello"
 * }
 *
 * Output payload (success):
 * {
 *     ok: true,
 *     data: { a: "1", b: "2", c: "hello" }
 * }
 *
 * Output payload (error):
 * {
 *     ok: false,
 *     error: "Query string parse error: ...",
 *     input: "..."
 * }
 */

import * as qs from "querystring";

export default async function coord_parse_query_string(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            ok: false,
            error: "coord_parse_query_string: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.trim();

    try {
        const parsed = qs.parse(text);
        return {
            ok: true,
            data: parsed
        };
    } catch (err) {
        return {
            ok: false,
            error: "Query string parse error: " + err.message,
            input: text
        };
    }
}
