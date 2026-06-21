// system/5_Function/validators/load_metadata_invariants.js

import { loadJson } from "../../utils/load_json.js";

export async function loadMetadataInvariants() {
    return await loadJson("../../3_Registry/Metadata/metadata_invariants.json");
}