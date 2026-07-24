import { loadIndexFile } from "../../3_Registry/service/atoms/load_index_file.js";

export async function loadVerbInvariants() {
    return loadIndexFile("system/3_Registry/service/atoms/verbs.index");
}
