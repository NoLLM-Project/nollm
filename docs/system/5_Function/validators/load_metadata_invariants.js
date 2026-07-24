import { loadJson } from "../../utils/load_json.js";
import path from "path";

export async function loadMetadataInvariants() {
    const filePath = path.join(process.cwd(), "system/3_Registry/Metadata/metadata_invariants.json");
    return await loadJson(filePath);
}
