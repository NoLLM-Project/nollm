/**
 * coord_clause_builder.js
 *
 * Real structural logic:
 * - identify subject chunk
 * - identify predicate chunk
 * - identify modifiers
 * - produce stable span
 *
 * This room is a pure structural engine.
 * It does NOT read workflowContext.
 * It only operates on the clauses passed in.
 */

export default async function coord_clause_builder(input) {
    const { clauses = [] } = input || {};

    // Normalize input: ensure we have a clause with chunks
    const first = clauses[0] || {};
    const chunks = Array.isArray(first.chunks) ? first.chunks : [];

    // --- SUBJECT ---
    const subject = chunks.find(c => c.type === "nominal") || null;

    // --- PREDICATE ---
    const predicate = chunks.find(c => c.type === "verbal") || null;

    // --- MODIFIERS ---
    const modifiers = chunks.filter(c => c !== subject && c !== predicate);

    const built = {
        id: `BCLS_0`,
        source_clause_id: first.id || null,
        structure: {
            subject,
            predicate,
            modifiers,
            span: chunks
        }
    };

    return { built };
}
