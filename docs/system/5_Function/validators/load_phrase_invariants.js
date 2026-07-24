import { loadPhraseIndex } from "../../3_Registry/service/atoms/load_phrase_index.js";

export async function loadPhraseInvariants() {
    return loadPhraseIndex("system/3_Registry/service/atoms/phrases.index");
}
