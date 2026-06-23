import { loadJson } from "../../../utils/load_json.js";

export async function loadCoordinateInvariants() {
    return await loadJson("../../3_Registry/Coordinates/coordinate_invariants.json");
}
