/**
 * Behavior for coord_parse_yaml
 *
 * Input payload:
 * {
 *     text: "a: 1\nb: 2"
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
 *     error: "YAML parse error: ...",
 *     input: "..."
 * }
 */

import { load } from "js-yaml";

export default async function coord_parse_yaml(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            ok: false,
            error: "coord_parse_yaml: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.trim();

    try {
        const parsed = load(text);
        return {
            ok: true,
            data: parsed
        };
    } catch (err) {
        return {
            ok: false,
            error: "YAML parse error: " + err.message,
            input: text
        };
    }
}

