// system/1_Engine/engine_core/movement_core.js

async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(`Failed to load JSON: ${path}`);
    }
    return res.json();
}

export async function createMovementCore() {
    // Load all coordinate registries
    const [
        worldCoords,
        hotelCoords,
        floorCoords,
        roomCoords,
        circulationCoords,
        abstractCoords
    ] = await Promise.all([
        loadJSON("../../3_Registry/Coordinates/world_coordinates.json"),
        loadJSON("../../3_Registry/Coordinates/hotel_coordinates.json"),
        loadJSON("../../3_Registry/Coordinates/floor_coordinates.json"),
        loadJSON("../../3_Registry/Coordinates/room_coordinates.json"),
        loadJSON("../../3_Registry/Coordinates/circulation_coordinates.json"),
        loadJSON("../../3_Registry/Coordinates/abstract_coordinates.json")
    ]);

    let currentPosition = null;
    const historyStack = [];

    // Merge registries
    const registry = {
        ...worldCoords,
        ...hotelCoords,
        ...floorCoords,
        ...roomCoords,
        ...circulationCoords,
        ...abstractCoords
    };

    return {
        moveToCoord(coordName) {
            const node = registry[coordName];
            if (!node) {
                throw new Error(`Unknown coordinate: ${coordName}`);
            }

            const { x, y, z } = node;

            if (currentPosition !== null) {
                historyStack.push(currentPosition);
            }

            currentPosition = { x, y, z };
        },

        undo() {
            if (historyStack.length > 0) {
                currentPosition = historyStack.pop();
            }
            return currentPosition;
        },

        current() {
            return currentPosition;
        },

        history() {
            return [...historyStack];
        }
    };
}
