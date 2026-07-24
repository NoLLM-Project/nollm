/**
 * load_phrase_index.js
 *
 * Shared loader for phrases.index.
 * Deterministic, structural, non-semantic.
 *
 * Supports multi-word surface phrases and optional subtype.
 */

import fs from "node:fs";
import path from "node:path";

export function loadPhraseIndex(relativePath) {
    const filePath = path.resolve(relativePath);

    const lines = fs.readFileSync(filePath, "utf8")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    const entries = [];

    for (const line of lines) {
        const parts = line.split(/\s+/);

        const id = parts[0];

        // Find the subtype (first ALLCAPS token after ID)
        let subtypeIndex = -1;
        for (let i = 1; i < parts.length; i++) {
            if (/^[A-Z0-9_]+$/.test(parts[i])) {
                subtypeIndex = i;
                break;
            }
        }

        let surfaceTokens;
        let subtype;
        let partTokens;

        if (subtypeIndex === -1) {
            // No subtype provided
            surfaceTokens = parts.slice(1);
            subtype = "P_GENERIC";
            partTokens = surfaceTokens;
        } else {
            surfaceTokens = parts.slice(1, subtypeIndex);
            subtype = parts[subtypeIndex];
            partTokens = parts.slice(subtypeIndex + 1);
        }

        const surface = surfaceTokens.join(" ");

        entries.push({
            id,
            surface,
            subtype,
            parts: partTokens
        });
    }

    return entries;
}
