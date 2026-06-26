import { loadJson } from "../../../utils/load_json.js";

export async function loadSKUInvariants() {
    return await loadJson("../../3_Registry/SKUs/sku_invariants.json");
}
