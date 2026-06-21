/**
 * Behavior for coord_atomize_service
 *
 * This is a checkpoint room. It does not transform the payload.
 * It validates the structural fields produced by PATH_ATOMIZE and
 * returns the next destination for the runner.
 *
 * Expected payload shape:
 * {
 *     tokens: [...],
 *     atoms: [...],
 *     chunks: [...],
 *     clauses: [...],
 *     sentence: {...}
 * }
 *
 * Output payload:
 * {
 *     next: "front_desk",
 *     payload: { ...unchanged payload... }
 * }
 */

module.exports = async function(payload, context) {
    // Basic validation: ensure the atomization pipeline produced the expected fields
    const missing = [];

    if (!payload || typeof payload !== "object") {
        return {
            error: "coord_atomize_service: payload missing or invalid",
            input: payload
        };
    }

    if (!Array.isArray(payload.tokens)) missing.push("tokens");
    if (!Array.isArray(payload.atoms)) missing.push("atoms");
    if (!Array.isArray(payload.chunks)) missing.push("chunks");
    if (!Array.isArray(payload.clauses)) missing.push("clauses");
    if (typeof payload.sentence !== "object" || payload.sentence === null) {
        missing.push("sentence");
    }

    if (missing.length > 0) {
        return {
            error: "coord_atomize_service: missing required fields",
            missing,
            input: payload
        };
    }

    // This room does not modify the payload.
    // It simply returns control to the front desk.
    return {
        next: "front_desk",
        payload
    };
};
