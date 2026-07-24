// system/5_Function/validators/load_noun_invariants.js

import { loadIndexFile } from "../../3_Registry/service/atoms/load_index_file.js";

export async function loadNounInvariants() {
    return loadIndexFile("system/3_Registry/service/atoms/nouns.index");
}
