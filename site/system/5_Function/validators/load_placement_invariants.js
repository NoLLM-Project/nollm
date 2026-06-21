// system/5_Function/validators/load_placement_invariants.js

import { loadJson } from "../../../utils/load_json.js";

export async function loadPlacementInvariants() {
    return await loadJson("../../3_Registry/Placement/placement_invariants.json");
}
