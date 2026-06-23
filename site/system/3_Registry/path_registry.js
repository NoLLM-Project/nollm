// system/3_Registry/path_registry.js
// Minimal routing table. No semantics.

export const pathRegistry = {

    // -------------------------
    // HOTEL PLANE
    // -------------------------

    "hotel_root": {
        coord: "coord_hotel_root",
        layer: "hotel"
    },

    "front_desk": {
        coord: "coord_front_desk",
        layer: "hotel"
    },

    "coat_room": {
        coord: "coord_coat_room",
        layer: "hotel"
    },

    "preprocess_service": {
        coord: "coord_preprocess_service",
        layer: "hotel"
    },

    "invariants_request": {
        coord: "coord_invariants_request",
        layer: "hotel"
    },

    "runtime_request": {
        coord: "coord_runtime_request",
        layer: "hotel"
    },

    "postprocess_service": {
        coord: "coord_postprocess_service",
        layer: "hotel"
    },

    "atomize_service": {
        coord: "coord_atomize_service",
        layer: "hotel"
    },

    // -------------------------
    // WORLD PLANE
    // -------------------------

    "tower": {
        coord: "coord_tower",
        layer: "world"
    },

    "invariants": {
        coord: "coord_invariants",
        layer: "world"
    }
};
