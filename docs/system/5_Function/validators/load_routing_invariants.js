import { loadJson } from "../../utils/load_json.js";
import path from "path";

export async function loadRoutingInvariants() {
    const filePath = path.join(process.cwd(), "system/3_Registry/Routing/routing_invariants.json");
    return await loadJson(filePath);
}
