// system/5_Function/validators/validate_profiles.js

export function validateProfiles(context, profileSpec, report) {

    const profile = context.profile;
    if (!profile) return;

    const rules = profileSpec[profile];
    if (!rules) return;

    const attempted = context.last_transition;

    if (rules.forbidden_transitions?.includes(attempted)) {
        report.profile.ok = false;
        report.profile.errors.push(
            `Profile '${profile}' forbids transition '${attempted}'`
        );
    }
}
