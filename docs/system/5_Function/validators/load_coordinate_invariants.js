import { loadJson } from "../../utils/load_json.js";
import path from "path";

export async function loadCoordinateInvariants() {
    const filePath = path.join(process.cwd(), "system/3_Registry/Coordinates/coordinate_invariants.json");
    return await loadJson(filePath);
}
