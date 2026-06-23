// system/5_Function/validators/load_naming_invariants.js

import { loadJson } from "../../../utils/load_json.js";

export async function loadNamingInvariants() {
    return await loadJson("../../3_Registry/Naming/naming_invariants.json");
}
