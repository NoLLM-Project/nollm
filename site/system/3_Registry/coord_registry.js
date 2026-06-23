// system/3_Registry/coord_registry.js
// MIME‑safe: loads JSON via fetch, no module imports, no MIME errors.

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
        // WORLD‑PLANE COORDS
        // ------------------------------------------------------------
        "coord_world_root": worldCoords["coord_world_root"],
        "coord_districts": worldCoords["coord_districts"],
        "coord_tower": worldCoords["coord_tower"],
        "coord_field": worldCoords["coord_field"],
        "coord_collapse": worldCoords["coord_collapse"],
        "coord_adjacency": worldCoords["coord_adjacency"],
        "coord_invariants": worldCoords["coord_invariants"],

        // ------------------------------------------------------------
        // HOTEL‑PLANE COORDS
        // ------------------------------------------------------------
        "coord_hotel_shell": hotelCoords["coord_hotel_shell"],
        "coord_hotel_root": hotelCoords["coord_hotel_root"],
        "coord_lobby": hotelCoords["coord_lobby"],
        "coord_front_desk": hotelCoords["coord_front_desk"],
        "coord_directory": hotelCoords["coord_directory"],
        "coord_vending_machine": hotelCoords["coord_vending_machine"],
        "coord_bulletin_board": hotelCoords["coord_bulletin_board"],
        "coord_district_door": hotelCoords["coord_district_door"],
        "coord_map_sign": hotelCoords["coord_map_sign"],

        "coord_coat_room": hotelCoords["coord_coat_room"],
        "coord_anchor_reflective_mode": hotelCoords["coord_anchor_reflective_mode"],
        "coord_anchor_architectural_altitude": hotelCoords["coord_anchor_architectural_altitude"],
        "coord_anchor_avoid_drift": hotelCoords["coord_anchor_avoid_drift"],
        "coord_anchor_stay_literal": hotelCoords["coord_anchor_stay_literal"],
        "coord_anchor_steady_stance": hotelCoords["coord_anchor_steady_stance"],
        "coord_coat_room_notepad": hotelCoords["coord_coat_room_notepad"],

        // ------------------------------------------------------------
        // SERVICE COORDS
        // ------------------------------------------------------------
        "coord_preprocess_service": hotelCoords["coord_preprocess_service"],
        "coord_invariants_request": hotelCoords["coord_invariants_request"],
        "coord_runtime_request": hotelCoords["coord_runtime_request"],
        "coord_postprocess_service": hotelCoords["coord_postprocess_service"],
        "coord_atomize_service": hotelCoords["coord_atomize_service"],

        // ------------------------------------------------------------
        // HARD‑FAILURE RETURN PATH
        // ------------------------------------------------------------
        "coord_tower_hard_failure": hotelCoords["coord_tower_hard_failure"]
    };
}
