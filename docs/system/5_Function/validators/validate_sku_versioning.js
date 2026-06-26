// system/5_Function/validators/validate_sku_versioning.js

export function validateSKUVersioning(skuRegistry, spec, report) {

    const versionPattern = new RegExp(spec.versioning.version_pattern);
    const versionHistory = {};

    for (const sku of Object.values(skuRegistry)) {

        // Version pattern
        if (!versionPattern.test(sku.version)) {
            report.versioning.ok = false;
            report.versioning.errors.push(
                `${sku.id} version '${sku.version}' does not match pattern ${spec.versioning.version_pattern}`
            );
        }

        // Monotonic increments
        if (spec.versioning.version_must_increment_monotonically) {
            const base = sku.object_id;
            const num = parseInt(sku.version.replace(/\D+/g, ""), 10);

            if (!versionHistory[base]) {
                versionHistory[base] = num;
            } else {
                if (num <= versionHistory[base]) {
                    report.versioning.ok = false;
                    report.versioning.errors.push(
                        `${sku.id} version '${sku.version}' not monotonic for object '${base}'`
                    );
                }
                versionHistory[base] = num;
            }
        }

        // No reuse
        if (spec.versioning.version_numbers_may_not_be_reused) {
            const key = `${sku.object_id}:${sku.version}`;
            if (versionHistory[key]) {
                report.versioning.ok = false;
                report.versioning.errors.push(
                    `${sku.id} reuses version '${sku.version}' for object '${sku.object_id}'`
                );
            }
            versionHistory[key] = true;
        }
    }
}
