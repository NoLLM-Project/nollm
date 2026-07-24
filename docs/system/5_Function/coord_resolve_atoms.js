/**
 * coord_resolve_atoms.js
 *
 * Resolves tokens into ATOM objects using the shared .index loaders.
 */

import { loadIndexFile } from "../3_Registry/service/atoms/load_index_file.js";

// Load all lexicons using shared loader
const nounsIndex = await loadIndexFile("system/3_Registry/service/atoms/nouns.index");
const verbsIndex = await loadIndexFile("system/3_Registry/service/atoms/verbs.index");
const adjectivesIndex = await loadIndexFile("system/3_Registry/service/atoms/adjectives.index");
const adverbsIndex = await loadIndexFile("system/3_Registry/service/atoms/adverbs.index");
const functionWordsIndex = await loadIndexFile("system/3_Registry/service/atoms/function_words.index");

// Build lookup maps
const NOUN_MAP = new Map(nounsIndex.map(e => [e.surface.toLowerCase(), e]));
const VERB_MAP = new Map(verbsIndex.map(e => [e.surface.toLowerCase(), e]));
const ADJ_MAP = new Map(adjectivesIndex.map(e => [e.surface.toLowerCase(), e]));
const ADV_MAP = new Map(adverbsIndex.map(e => [e.surface.toLowerCase(), e]));
const F_MAP = new Map(functionWordsIndex.map(e => [e.surface.toLowerCase(), e]));

export default async function coord_resolve_atoms(args) {
    const { payload, workflowContext } = args || {};

    // ⭐ PATCH: Prefer preprocess tokens, fallback to atomize tokens
    const tokens =
        payload?.tokens ??
        workflowContext["coord_tokenize_text"]?.result ??            // ← preprocess canonical tokens
        workflowContext["coord_tokenize_for_atoms"]?.payload?.result; // ← fallback only

    if (!Array.isArray(tokens)) {
        return {
            error: "coord_resolve_atoms: missing or invalid 'tokens'",
            input: payload
        };
    }

    const atoms = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const t = token.toLowerCase();

        let entry;
        let type;

        if (F_MAP.has(t)) {
            entry = F_MAP.get(t);
            type = "F";
        } else if (NOUN_MAP.has(t)) {
            entry = NOUN_MAP.get(t);
            type = "N";
        } else if (VERB_MAP.has(t)) {
            entry = VERB_MAP.get(t);
            type = "V";
        } else if (ADJ_MAP.has(t)) {
            entry = ADJ_MAP.get(t);
            type = "J";
        } else if (ADV_MAP.has(t)) {
            entry = ADV_MAP.get(t);
            type = "D";
        }

        if (entry) {
            atoms.push({
                id: entry.id,
                type,
                subtype: entry.subtype,
                surface: token,
                span: [i, i]
            });
        } else {
            atoms.push({
                id: `UNK_${i}`,
                type: "UNK",
                subtype: "UNK",
                surface: token,
                span: [i, i]
            });
        }
    }

    return {
        payload: {
            tokens,
            atoms,
            __log: "coord_resolve_atoms"
        }
    };
}
