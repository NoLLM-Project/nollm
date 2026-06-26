// system/5_Function/validators/validate_routing_profiles.js

export function validateRoutingProfiles(routes, spec, report) {

    for (const r of routes) {

        const p = r.profile;

        if (p === "strict" && !r.dispatches_module) {
            report.profiles.ok = false;
            report.profiles.errors.push(`${r.id} strict profile violates dispatch-only rule`);
        }

        if (p === "ui" && r.action === "load_scene") {
            report.profiles.ok = false;
            report.profiles.errors.push(`${r.id} ui profile cannot load scenes`);
        }

        if (p === "stance" && r.action !== "apply_anchor") {
            report.profiles.ok = false;
            report.profiles.errors.push(`${r.id} stance profile can only apply anchors`);
        }

        if (p === "notepad" && r.action !== "store_text") {
            report.profiles.ok = false;
            report.profiles.errors.push(`${r.id} notepad profile can only store text`);
        }

        if (p === "none") {
            report.profiles.ok = false;
            report.profiles.errors.push(`${r.id} none profile cannot transition`);
        }
    }
}
