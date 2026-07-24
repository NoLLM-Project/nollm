// system/5_Function/validators/run_atomize_registry_invariants.js

import { runNounInvariants } from "./run_noun_invariants.js";
import { runVerbInvariants } from "./run_verb_invariants.js";
import { runAdjectiveInvariants } from "./run_adjective_invariants.js";
import { runAdverbInvariants } from "./run_adverb_invariants.js";
import { runFunctionWordInvariants } from "./run_function_word_invariants.js";
import { runPhraseInvariants } from "./run_phrase_invariants.js";

export async function runAtomizeRegistryInvariants() {
    const reports = [
        await runNounInvariants(),
        await runVerbInvariants(),
        await runAdjectiveInvariants(),
        await runAdverbInvariants(),
        await runFunctionWordInvariants(),
        await runPhraseInvariants()
    ];

    return {
        ok: reports.every(r => r.ok),
        reports
    };
}
