// system/3_Registry/coord_registry.js

async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(`Failed to load JSON: ${path}`);
    }
    return res.json();
}

export async function createCoordRegistry() {
    const [worldCoords, hotelCoords] = await Promise.all([
        loadJSON("./Coordinates/world_coordinates.json"),
        loadJSON("./Coordinates/hotel_coordinates.json")
    ]);

    return {

        // ------------------------------------------------------------
        // WORLD-PLANE COORDS
        // ------------------------------------------------------------
        "coord_tower": worldCoords["coord_tower"],
        "coord_world_root": worldCoords["coord_world_root"],
        "coord_field": worldCoords["coord_field"],
        "coord_adjacency": worldCoords["coord_adjacency"],
        "coord_hotel_shell": worldCoords["coord_hotel_shell"],
        "coord_hotel_root": worldCoords["coord_hotel_root"],
        "coord_lobby": worldCoords["coord_lobby"],
        "coord_front_desk": worldCoords["coord_front_desk"],

        // ------------------------------------------------------------
        // HOTEL-PLANE COORDS
        // ------------------------------------------------------------
        "coord_coat_room": hotelCoords["coord_coat_room"],
        "coord_preprocess_service": hotelCoords["coord_preprocess_service"],
        "coord_invariants_request": hotelCoords["coord_invariants_request"],
        "coord_runtime_request": hotelCoords["coord_runtime_request"],
        "coord_postprocess_service": hotelCoords["coord_postprocess_service"],

        // Hard-failure return path
        "coord_tower_hard_failure": hotelCoords["coord_tower_hard_failure"]
    };
}
