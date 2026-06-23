import { loadJson } from "../../../utils/loadJson.js";

export async function loadCoordinateInvariants() {
    return await loadJson("../../3_Registry/Coordinates/coordinate_invariants.json");
}
