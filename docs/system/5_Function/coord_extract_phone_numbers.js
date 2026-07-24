/**
 * Behavior for coord_extract_phone_numbers
 *
 * Input payload:
 * {
 *     text: "some text containing phone numbers"
 * }
 *
 * Output payload:
 * {
 *     phone_numbers: ["203-555-1234", "(800) 123-4567", ...]
 * }
 */

export default async function coord_extract_phone_numbers(args) {
    const { payload } = args || {};

    if (!payload || typeof payload.text !== "string") {
        return {
            error: "coord_extract_phone_numbers: missing or invalid 'text' field",
            input: {
                rawText: payload?.text ?? null
            }
        };
    }

    const text = payload.text;

    // Deterministic phone number extraction:
    // Matches:
    // - (123) 456-7890
    // - 123-456-7890
    // - 123.456.7890
    // - 123 456 7890
    // - +1 123 456 7890
    const regex =
        /(\+?\d{1,2}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g;

    const matches = text.match(regex) || [];

    const unique = [...new Set(matches.map(m => m.trim()))];

    return {
        phone_numbers: unique
    };
}

