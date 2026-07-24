import { loadJson } from "../../utils/load_json.js";
import path from "path";

export async function loadSKUInvariants() {
    const filePath = path.join(process.cwd(), "system/3_Registry/SKUs/sku_invariants.json");
    return await loadJson(filePath);
}
