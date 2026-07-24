/**
 * Behavior for coord_parse_xml
 *
 * Input payload:
 * {
 *     text: "<root><a>1</a><b>2</b></root>"
 * }
 *
 * Output payload (success):
 * {
 *     ok: true,
 *     data: { root: { a: "1", b: "2" } }
 * }
 *
 * Output payload (error):
 * {
 *     ok: false,
 *     error: "XML parse error: ...",
 *     input: "..."
 * }
 */

import { XMLParser } from "fast-xml-parser";

export default async function coord_parse_xml(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            ok: false,
            error: "coord_parse_xml: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text.trim();

    try {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        const parsed = parser.parse(text);

        return {
            ok: true,
            data: parsed
        };
    } catch (err) {
        return {
            ok: false,
            error: "XML parse error: " + err.message,
            input: text
        };
    }
}

