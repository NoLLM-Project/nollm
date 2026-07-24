/**
 * Behavior for coord_parse_csv
 *
 * Input payload:
 * {
 *     text: "a,b,c\n1,2,3\n4,5,6"
 * }
 *
 * Output payload (success):
 * {
 *     ok: true,
 *     data: [
 *         { a: "1", b: "2", c: "3" },
 *         { a: "4", b: "5", c: "6" }
 *     ]
 * }
 *
 * Output payload (error):
 * {
 *     ok: false,
 *     error: "CSV parse error: ...",
 *     input: "..."
 * }
 */

import { parse } from "csv-parse/sync";

export default async function coord_parse_csv(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            ok: false,
            error: "coord_parse_csv: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.trim();

    try {
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        return {
            ok: true,
            data: records
        };
    } catch (err) {
        return {
            ok: false,
            error: "CSV parse error: " + err.message,
            input: text
        };
    }
}

