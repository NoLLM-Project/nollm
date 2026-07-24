// system/5_Function/validators/load_naming_invariants.js

import { loadJson } from "../../utils/load_json.js";
import path from "path";

export async function loadNamingInvariants() {
    const filePath = path.join(process.cwd(), "system/3_Registry/Naming/naming_invariants.json");
    return await loadJson(filePath);
}
