// system/3_Registry/path_registry.js

export const pathRegistry = {

    // ------------------------------------------------------------
    // HOTEL LAYER
    // ------------------------------------------------------------

    "hotel_root": {
        coord: "coord_hotel_root",
        layer: "hotel",
        description: "Entry point for the hotel layer"
    },

    "front_desk": {
        coord: "coord_front_desk",
        layer: "hotel",
        description: "Hotel front desk — routes to coat room, preprocess, invariants request"
    },

    "coat_room": {
        coord: "coord_coat_room",
        layer: "hotel",
        description: "Coat room — applies stance anchors and notepad"
    },

    "preprocess_service_room": {
        coord: "coord_preprocess_service_room",
        layer: "hotel",
        description: "Hotel → service corridor handoff for preprocessing"
    },

    "invariants_request": {
        coord: "coord_invariants_request",
        layer: "hotel",
        description: "Hotel membrane node — requests invariants check"
    },

    // NEW: Hard-failure return path
    "tower": {
        coord: "coord_tower",
        layer: "hotel",
        description: "Hard-failure return path — invariants hard failures go here"
    },


    // ------------------------------------------------------------
    // SYSTEM LAYER (OUTSIDE HOTEL)
    // ------------------------------------------------------------

    "invariants": {
        coord: "coord_invariants",
        layer: "system",
        description: "System-level invariants check (runner-only)"
    }

};
