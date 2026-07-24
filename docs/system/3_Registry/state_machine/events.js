// 3_Registry/state_machine/events.js
// Vocabulary: defines what events exist.
// No transitions. No behavior. No rules.

export const EVENTS = {
    RECEIVE_RESULT: "RECEIVE_RESULT",
    PARSE_RESULT: "PARSE_RESULT",

    INVARIANT_ALLOW: "INVARIANT_ALLOW",
    INVARIANT_DENY: "INVARIANT_DENY",

    UTTERANCE_COMPLETE: "UTTERANCE_COMPLETE"
};
