// system/5_Function/validators/validate_metadata_anchors.js

import { readFile } from "fs/promises";
import { dirname, resolve, isAbsolute } from "path";
import { fileURLToPath } from "url";

console.log("ANCHORS FILE LOADED FROM:", import.meta.url);

// ------------------------------------------------------------
// JSON Loader (module-relative)
// ------------------------------------------------------------
export async function loadJson(pathInput) {
  const here = dirname(fileURLToPath(import.meta.url));

  const absolutePath = isAbsolute(pathInput)
    ? pathInput
    : resolve(here, pathInput);

  const data = await readFile(absolutePath, "utf8");
  return JSON.parse(data);
}

// ------------------------------------------------------------
// ⭐ Metadata Anchors Loader (continuity + stability)
// ------------------------------------------------------------
export async function loadMetadataAnchors() {
    const continuity = await loadJson("../../3_Registry/Metadata/continuity.json");
    const stability  = await loadJson("../../3_Registry/Metadata/anchors.json");
    return { continuity, stability };
}

// ------------------------------------------------------------
// Metadata Anchors Validator
// ------------------------------------------------------------
export function validateMetadataAnchors(metadataRegistry, spec, report, continuity, stability) {

    // Allow both array-style and object-style registry files
    const continuityAllowed = Array.isArray(continuity)
        ? continuity
        : Array.isArray(continuity?.allowed)
            ? continuity.allowed
            : [];

    const stabilityAllowed = Array.isArray(stability)
        ? stability
        : Array.isArray(stability?.allowed)
            ? stability.allowed
            : [];

    for (const meta of Object.values(metadataRegistry)) {

        const anchors = meta.anchors || {};

        // Identity anchor matches canonical
        if (spec.metadata_anchors.identity_matches_canonical) {
            if (anchors.identity && anchors.identity !== meta.canonical_name) {
                report.anchors.ok = false;
                report.anchors.errors.push(
                    `${meta.id} anchor.identity '${anchors.identity}' does not match canonical '${meta.canonical_name}'`
                );
            }
        }

        // Continuity allowed values
        if (spec.metadata_anchors.continuity_allowed_values_file) {
            if (anchors.continuity && !continuityAllowed.includes(anchors.continuity)) {
                report.anchors.ok = false;
                report.anchors.errors.push(
                    `${meta.id} anchor.continuity '${anchors.continuity}' not in allowed continuity states`
                );
            }
        }

        // Stability allowed values
        if (spec.metadata_anchors.stability_allowed_values_file) {
            if (anchors.stability && !stabilityAllowed.includes(anchors.stability)) {
                report.anchors.ok = false;
                report.anchors.errors.push(
                    `${meta.id} anchor.stability '${anchors.stability}' not in allowed stability states`
                );
            }
        }

        // Anchors must not contradict each other
        if (spec.metadata_anchors.anchors_must_not_contradict) {
            if (
                anchors.identity &&
                anchors.stability &&
                anchors.identity.includes("null") &&
                anchors.stability === "stable"
            ) {
                report.anchors.ok = false;
                report.anchors.errors.push(
                    `${meta.id} anchors identity/stability contradiction`
                );
            }
        }
    }
}
