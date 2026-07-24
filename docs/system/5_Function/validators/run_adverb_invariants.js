import { loadAdverbInvariants } from "./load_adverb_invariants.js";
import { validateAdverbInvariants } from "./validate_adverb_invariants.js";

export async function runAdverbInvariants() {
    const entries = await loadAdverbInvariants();
    return validateAdverbInvariants(entries);
}
