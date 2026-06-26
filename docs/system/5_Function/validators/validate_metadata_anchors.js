// system/5_Function/validators/validate_metadata_anchors.js

import { loadJson } from "../../../utils/load_json.js";

// Loader: async, uses the single JSON primitive
export async function loadMetadataAnchors() {
    const continuity = await loadJson("../../3_Registry/Metadata/continuity.json");
    const stability = await loadJson("../../3_Registry/Metadata/anchors.json");
    return { continuity, stability };
}

// Validator: pure, synchronous, receives continuity + stability from the loader
export function validateMetadataAnchors(metadataRegistry, spec, report, continuity, stability) {

    for (const meta of Object.values(metadataRegistry)) {

        const anchors = meta.anchors || {};

        // Identity anchor matches canonical
        if (spec.anchors.identity_matches_canonical) {
            if (anchors.identity && anchors.identity !== meta.canonical_name) {
                report.anchors.ok = false;
                report.anchors.errors.push(
                    `${meta.id} anchor.identity '${anchors.identity}' does not match canonical '${meta.canonical_name}'`
                );
            }
        }

        // Continuity allowed values
        if (spec.anchors.continuity_allowed_values_file) {
            if (anchors.continuity && !continuity.allowed.includes(anchors.continuity)) {
                report.anchors.ok = false;
                report.anchors.errors.push(
                    `${meta.id} anchor.continuity '${anchors.continuity}' not in allowed continuity states`
                );
            }
        }

        // Stability allowed values
        if (spec.anchors.stability_allowed_values_file) {
            if (anchors.stability && !stability.allowed.includes(anchors.stability)) {
                report.anchors.ok = false;
                report.anchors.errors.push(
                    `${meta.id} anchor.stability '${anchors.stability}' not in allowed stability states`
                );
            }
        }

        // Anchors must not contradict each other
        if (spec.anchors.anchors_must_not_contradict) {
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
