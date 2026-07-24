import { loadJson } from "../../utils/load_json.js";
import path from "path";

export async function loadPlacementInvariants() {
    const filePath = path.join(process.cwd(), "system/3_Registry/Placement/placement_invariants.json");
    return await loadJson(filePath);
}
