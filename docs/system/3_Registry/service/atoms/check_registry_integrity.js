/**
 * check_registry_integrity.js
 *
 * Shared integrity checker for all .index lexicon files.
 * Deterministic, structural, non-semantic.
 *
 * Produces an invariants report:
 * {
 *   ok: boolean,
 *   errors: [...],
 *   warnings: [...],
 *   stats: {...}
 * }
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Load a .index file and return raw lines.
 */
function loadRaw(relativePath) {
    const filePath = path.resolve(relativePath);

    return fs.readFileSync(filePath, "utf8")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);
}

/**
 * Validate a single registry line.
 * Expected format:
 *   ID SURFACE SUBTYPE
 */
function validateLine(line, registryName, errors, warnings) {
    const parts = line.split(/\s+/);

    if (parts.length < 3) {
        errors.push({
            registry: registryName,
            line,
            issue: "MALFORMED_LINE",
            detail: "Expected: ID SURFACE SUBTYPE"
        });
        return null;
    }

    const [id, surface, subtype] = parts;

    // Validate ID format
    if (!/^[A-Z][0-9]{8}$/.test(id)) {
        errors.push({
            registry: registryName,
            line,
            issue: "INVALID_ID_FORMAT",
            detail: `ID '${id}' must match /^[A-Z][0-9]{8}$/`
        });
    }

    // Validate subtype format
    if (!/^[A-Z0-9_]+$/.test(subtype)) {
        errors.push({
            registry: registryName,
            line,
            issue: "INVALID_SUBTYPE_FORMAT",
            detail: `Subtype '${subtype}' must match /^[A-Z0-9_]+$/`
        });
    }

    return { id, surface, subtype };
}

/**
 * Validate an entire registry file.
 */
function validateRegistry(relativePath, registryName, globalSurfaces, globalIds) {
    const errors = [];
    const warnings = [];
    const entries = [];

    const rawLines = loadRaw(relativePath);

    for (const line of rawLines) {
        const entry = validateLine(line, registryName, errors, warnings);
        if (!entry) continue;

        const { id, surface } = entry;

        // Check for duplicate surfaces within registry
        if (entries.some(e => e.surface.toLowerCase() === surface.toLowerCase())) {
            errors.push({
                registry: registryName,
                line,
                issue: "DUPLICATE_SURFACE_IN_REGISTRY",
                detail: `Surface '${surface}' appears more than once`
            });
        }

        // Check for duplicate IDs within registry
        if (entries.some(e => e.id === id)) {
            errors.push({
                registry: registryName,
                line,
                issue: "DUPLICATE_ID_IN_REGISTRY",
                detail: `ID '${id}' appears more than once`
            });
        }

        // Check for cross-registry surface collisions
        if (globalSurfaces.has(surface.toLowerCase())) {
            warnings.push({
                registry: registryName,
                line,
                issue: "SURFACE_COLLISION_ACROSS_REGISTRIES",
                detail: `Surface '${surface}' appears in multiple registries`
            });
        }

        // Check for cross-registry ID collisions
        if (globalIds.has(id)) {
            errors.push({
                registry: registryName,
                line,
                issue: "ID_COLLISION_ACROSS_REGISTRIES",
                detail: `ID '${id}' appears in multiple registries`
            });
        }

        globalSurfaces.add(surface.toLowerCase());
        globalIds.add(id);

        entries.push(entry);
    }

    return {
        registry: registryName,
        entries,
        errors,
        warnings,
        stats: {
            count: entries.length
        }
    };
}

/**
 * Main integrity checker for all registries.
 */
export function checkAllRegistries() {
    const globalSurfaces = new Set();
    const globalIds = new Set();

    const registries = [
        { name: "nouns", path: "system/3_Registry/service/atoms/nouns.index" },
        { name: "verbs", path: "system/3_Registry/service/atoms/verbs.index" },
        { name: "adjectives", path: "system/3_Registry/service/atoms/adjectives.index" },
        { name: "adverbs", path: "system/3_Registry/service/atoms/adverbs.index" },
        { name: "function_words", path: "system/3_Registry/service/atoms/function_words.index" },
        { name: "phrases", path: "system/3_Registry/service/atoms/phrases.index" }
    ];

    const reports = registries.map(reg =>
        validateRegistry(reg.path, reg.name, globalSurfaces, globalIds)
    );

    const allErrors = reports.flatMap(r => r.errors);
    const allWarnings = reports.flatMap(r => r.warnings);

    return {
        ok: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        registries: reports
    };
}
