// system/router.js

import { coord_front_desk } from "./5_Function/coord_front_desk.js";
import { coord_coat_room } from "./5_Function/coord_coat_room.js";
import { coord_preprocess_service_room } from "./5_Function/coord_preprocess_service.js";
import { coord_invariants_request } from "./5_Function/coord_invariants_request.js";
import { coord_invariants } from "./5_Function/coord_invariants.js";
import { coord_runtime_request } from "./5_Function/coord_runtime_request.js";
import { coord_atomize_service } from "./5_Function/coord_atomize_service.js";
import { coord_postprocess_service_room } from "./5_Function/coord_postprocess_service.js";
import { coord_tower } from "./5_Function/coord_tower.js";

export const ROUTING_TABLE = {

    // ------------------------------------------------------------
    // CONTROL NODES (no xyz, no engines)
    // ------------------------------------------------------------
    "coord_front_desk": coord_front_desk,
    "coord_invariants_request": coord_invariants_request,
    "coord_invariants": coord_invariants,
    "coord_runtime_request": coord_runtime_request,

    // ------------------------------------------------------------
    // SPATIAL ROOMS (xyz + engines)
    // ------------------------------------------------------------
    "coord_coat_room": coord_coat_room,
    "coord_preprocess_service": coord_preprocess_service,
    "coord_atomize_service": coord_atomize_service,
    "coord_postprocess_service": coord_postprocess_service,

    // ------------------------------------------------------------
    // SPECIAL CASES
    // ------------------------------------------------------------
    "tower": coord_tower
};
