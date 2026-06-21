// coordinate_walker.js
// Walks a coordinate sequence mechanically.

export function createWalker(sequence) {
    let index = 0;

    return {
        hasNext() {
            return index < sequence.length;
        },

        next() {
            // Returns the next coordinate without interpretation.
            return sequence[index++];
        }
    };
}
