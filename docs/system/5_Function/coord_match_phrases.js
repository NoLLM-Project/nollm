/**
 * coord_match_phrases.js
 *
 * Matches multi-word phrase atoms using the shared phrase loader.
 */

import { loadPhraseIndex } from "../3_Registry/service/atoms/load_phrase_index.js";

// Load phrase registry using shared loader
const phrasesIndex = await loadPhraseIndex("system/3_Registry/service/atoms/phrases.index");

// Build lookup map
const PHRASE_MAP = new Map(
    phrasesIndex.map(entry => [entry.surface.toLowerCase(), entry])
);

function matchPhrases(atoms) {
    const result = [];
    let i = 0;

    while (i < atoms.length) {
        let matched = false;

        for (const phrase of phrasesIndex) {
            const parts = phrase.parts;

            let ok = true;
            for (let j = 0; j < parts.length; j++) {
                if (i + j >= atoms.length) {
                    ok = false;
                    break;
                }
                const atomSurface = atoms[i + j].surface.toLowerCase();
                const partSurface = parts[j].toLowerCase();
                if (atomSurface !== partSurface) {
                    ok = false;
                    break;
                }
            }

            if (ok) {
                const start = atoms[i].span[0];
                const end = atoms[i + parts.length - 1].span[1];

                result.push({
                    id: phrase.id,
                    type: "P",
                    subtype: phrase.subtype,
                    surface: phrase.surface,
                    span: [start, end]
                });

                i += parts.length;
                matched = true;
                break;
            }
        }

        if (!matched) {
            result.push(atoms[i]);
            i++;
        }
    }

    return result;
}

export default async function coord_match_phrases(args) {
    const { payload, workflowContext } = args || {};

    // ⭐ PATCH: Prefer preprocess atoms, fallback to atomize atoms
    const atoms =
        payload?.atoms ??
        workflowContext["coord_resolve_atoms"]?.payload?.atoms;

    if (!Array.isArray(atoms)) {
        return {
            error: "coord_match_phrases: missing or invalid 'atoms'",
            input: payload
        };
    }

    // ⭐ PATCH: Consume preprocess cleaned/lowercased text (if needed later)
    const rawText =
        payload?.rawText ??
        workflowContext["coord_clean_text"]?.payload?.result ??
        workflowContext["coord_lowercase_text"]?.result;

    const text =
        payload?.text ??
        workflowContext["coord_lowercase_text"]?.result ??
        workflowContext["coord_clean_text"]?.payload?.result;

    const phraseAtoms = matchPhrases(atoms);

    return {
        payload: {
            ...payload,
            atoms: phraseAtoms,
            rawText,
            text,
            __log: "coord_match_phrases"
        }
    };
}
