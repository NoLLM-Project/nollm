/**
 * load_index_file.js
 *
 * Shared loader for all .index lexicon files.
 * Deterministic, structural, non-semantic.
 *
 * Each .index line must be:
 * ID SURFACE SUBTYPE
 *
 * Example:
 * J00000001 abandoned ADJ_QUALITY_INHERENT
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Load a .index file and convert each line into:
 * { id, surface, subtype }
 */
export function loadIndexFile(relativePath) {
    const filePath = path.resolve(relativePath);

    const raw = fs.readFileSync(filePath, "utf8")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    return raw.map(line => {
        const parts = line.split(/\s+/);

        // Minimal validation
        if (parts.length < 3) {
            return {
                id: "MALFORMED",
                surface: line,
                subtype: "MALFORMED"
            };
        }

        const [id, surface, subtype] = parts;
        return { id, surface, subtype };
    });
}
