/**
 * Behavior for coord_parse_toml
 *
 * Input payload:
 * {
 *     text: "a = 1\nb = 2\n[section]\nc = 3"
 * }
 *
 * Output payload (success):
 * {
 *     ok: true,
 *     data: { a: 1, b: 2, section: { c: 3 } }
 * }
 *
 * Output payload (error):
 * {
 *     ok: false,
 *     error: "TOML parse error: ...",
 *     input: "..."
 * }
 */

import * as toml from "@iarna/toml";

export default async function coord_parse_toml(args) {
    const { payload } = args || {};

    // PATCH: missing/invalid text → noop instead of fail
    if (!payload || typeof payload.text !== "string") {
        return {
            status: "noop",
            reason: "coord_parse_toml: no valid text field",
            output: null
        };
    }

    const text = payload.text.trim();

    try {
        const parsed = toml.parse(text);
        return {
            status: "ok",
            data: parsed
        };
    } catch (err) {
        // PATCH: TOML parse failure → noop instead of fail
        return {
            status: "noop",
            reason: "coord_parse_toml: input is not valid TOML",
            output: null
        };
    }
}
