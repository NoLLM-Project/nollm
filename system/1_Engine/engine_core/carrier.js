// carrier.js
// Positional carrier. Holds content only during mechanical movement.

export function createCarrier(content) {
    let currentPosition = null;
    let payload = content;

    return {
        moveTo(position) {
            // Movement is positional, not semantic.
            currentPosition = position;
        },

        clear() {
            // Content is discarded when the engine finishes.
            currentPosition = null;
            payload = null;
        }
    };
}
