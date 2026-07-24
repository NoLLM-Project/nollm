import { loadFunctionWordInvariants } from "./load_function_word_invariants.js";
import { validateFunctionWordInvariants } from "./validate_function_word_invariants.js";

export async function runFunctionWordInvariants() {
    const entries = await loadFunctionWordInvariants();
    return validateFunctionWordInvariants(entries);
}
