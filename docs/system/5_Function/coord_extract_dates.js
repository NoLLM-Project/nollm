/**
 * Behavior for coord_extract_dates
 *
 * Input payload:
 * {
 *     text: "some text containing dates"
 * }
 *
 * Output payload:
 * {
 *     dates: ["06/12/2026", "2026-06-12", "June 12, 2026", ...]
 * }
 */

export default async function coord_extract_dates(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_dates: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic date extraction:
    const regex = new RegExp(
        [
            // 06/12/2026 or 6/12/2026
            "\\b\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}\\b",

            // 2026-06-12
            "\\b\\d{4}[\\-]\\d{1,2}[\\-]\\d{1,2}\\b",

            // June 12, 2026 or Jun 12, 2026
            "\\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|" +
                "January|February|March|April|May|June|July|August|September|October|November|December)" +
                "\\s+\\d{1,2},\\s*\\d{4}\\b",

            // 12 June 2026
            "\\b\\d{1,2}\\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|" +
                "January|February|March|April|May|June|July|August|September|October|November|December)" +
                "\\s+\\d{4}\\b"
        ].join("|"),
        "gi"
    );

    const matches = text.match(regex) || [];
    const unique = [...new Set(matches.map(d => d.trim()))];

    return {
        dates: unique
    };
}

