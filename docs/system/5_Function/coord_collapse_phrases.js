/**
 * coord_collapse_phrases.js
 *
 * Real structural logic:
 * - identify head atom
 * - flatten atom token spans
 * - mark modifiers
 */

export default async function coord_collapse_phrases(input) {
    const { phrases = [] } = input || {};

    const collapsed = phrases.map((phr, idx) => {
        const atoms = phr.atoms || [];

        // --- HEAD SELECTION ---
        let head = null;

        if (phr.type === "noun_phrase") {
            head = atoms.filter(a => a.type === "noun").slice(-1)[0] || atoms[0];
        } else if (phr.type === "verb_phrase") {
            head = atoms.filter(a => a.type === "verb")[0] || atoms[0];
        } else if (phr.type === "prep_phrase") {
            head = atoms.slice(-1)[0];
        } else {
            head = atoms[0];
        }

        // --- MODIFIERS ---
        const modifiers = atoms.filter(a => a !== head);

        // --- FLATTEN TOKENS ---
        const tokens = atoms.flatMap(a => a.tokens || []);

        return {
            id: `CPHR_${idx}`,
            source_phrase_id: phr.id || null,
            tokens,
            role: head?.type || "unknown",
            head,
            modifiers
        };
    });

    return { collapsed };
}
