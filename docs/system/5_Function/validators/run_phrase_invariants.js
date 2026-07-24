// system/5_Function/validators/run_phrase_invariants.js

import { loadPhraseInvariants } from "./load_phrase_invariants.js";
import { validatePhraseInvariants } from "./validate_phrase_invariants.js";

export async function runPhraseInvariants() {
    const entries = await loadPhraseInvariants();
    return validatePhraseInvariants(entries);
}
