// system/3_Registry/path_registry.js

export const pathRegistry = {

    // ------------------------------------------------------------
    // HOTEL LAYER
    // ------------------------------------------------------------

    "hotel_root": {
        coord: "coord_hotel_root",
        layer: "hotel",
    },

    "front_desk": {
        coord: "coord_front_desk",
        layer: "hotel",
    },

    "coat_room": {
        coord: "coord_coat_room",
        layer: "hotel",
    },

    "preprocess_service": {
        coord: "coord_preprocess_service",
        layer: "hotel",
    },

    "postprocess_service": {
        coord: "coord_postprocess_service",
        layer: "hotel",
    },

    "atomize_service": {
        coord: "coord_atomize_service",
        layer: "hotel",
    },

    "runtime_request": {
        coord: "coord_runtime_request",
        layer: "hotel",
    },

    "invariants_request": {
        coord: "coord_invariants_request",
        layer: "hotel",
    },

    // NEW: Hard-failure return path
    "tower": {
        coord: "coord_tower",
        layer: "hotel",
    },


    // ------------------------------------------------------------
    // SYSTEM LAYER (OUTSIDE HOTEL)
    // ------------------------------------------------------------

    "invariants": {
        coord: "coord_invariants",
        layer: "system",
    }

};
