// turn_local_store.js
// Ephemeral mechanical store. Clears automatically.

export function createTurnLocalStore() {
    let store = {};

    return {
        set(key, value) {
            store[key] = value;
        },

        get(key) {
            return store[key];
        },

        clear() {
            store = {};
        }
    };
}
