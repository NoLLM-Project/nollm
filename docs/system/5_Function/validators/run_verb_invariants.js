import { loadVerbInvariants } from "./load_verb_invariants.js";
import { validateVerbInvariants } from "./validate_verb_invariants.js";

export async function runVerbInvariants() {
    const entries = await loadVerbInvariants();
    return validateVerbInvariants(entries);
}
