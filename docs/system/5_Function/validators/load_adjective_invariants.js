// system/5_Function/validators/load_adjective_invariants.js

import { loadIndexFile } from "../../3_Registry/service/atoms/load_index_file.js";

export async function loadAdjectiveInvariants() {
    return loadIndexFile("system/3_Registry/service/atoms/adjectives.index");
}
