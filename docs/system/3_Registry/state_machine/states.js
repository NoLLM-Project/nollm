// 3_Registry/state_machine/states.js
// Vocabulary: defines what states exist.
// No transitions. No behavior. No rules.

export const STATES = {
    S0_RECEIVE: "S0_RECEIVE",
    S_PREPROCESS: "S_PREPROCESS",
    S_INVARIANT_CHECK: "S_INVARIANT_CHECK",
    S_POSTPROCESS: "S_POSTPROCESS",
    S_SAFEFAIL: "S_SAFEFAIL",
    S_ERASED: "S_ERASED"
};
