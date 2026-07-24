import { loadAdjectiveInvariants } from "./load_adjective_invariants.js";
import { validateAdjectiveInvariants } from "./validate_adjective_invariants.js";

export async function runAdjectiveInvariants() {
    const entries = await loadAdjectiveInvariants();
    return validateAdjectiveInvariants(entries);
}
