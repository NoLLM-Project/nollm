// system/5_Function/validators/run_noun_invariants.js

import { loadNounInvariants } from "./load_noun_invariants.js";
import { validateNounInvariants } from "./validate_noun_invariants.js";

export async function runNounInvariants() {
    const entries = await loadNounInvariants();
    return validateNounInvariants(entries);
}
