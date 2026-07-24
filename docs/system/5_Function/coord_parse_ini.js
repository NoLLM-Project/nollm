/**
 * Behavior for coord_parse_ini
 *
 * Input payload:
 * {
 *     text: "[section]\na=1\nb=2"
 * }
 *
 * Output payload (success):
 * {
 *     ok: true,
 *     data: {
 *         section: { a: "1", b: "2" }
 *     }
 * }
 *
 * Output payload (error):
 * {
 *     ok: false,
 *     error: "INI parse error: ...",
 *     input: "..."
 * }
 */

import * as ini from "ini";

export default async function coord_parse_ini(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            ok: false,
            error: "coord_parse_ini: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.trim();

    try {
        const parsed = ini.parse(text);
        return {
            ok: true,
            data: parsed
        };
    } catch (err) {
        return {
            ok: false,
            error: "INI parse error: " + err.message,
            input: text
        };
    }
}

