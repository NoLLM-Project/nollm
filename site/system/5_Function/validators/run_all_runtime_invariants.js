// system/5_Function/validators/run_all_runtime_invariants.js

export function runAllRuntimeInvariants(carrier, runtimePlan) {

    const {
        func,   // resolved function descriptor for the coord
        route   // execution route (rooms in order)
    } = runtimePlan || {};

    const report = {
        function:    { ok: true, errors: [] },
        representation: { ok: true, errors: [] },
        carrier:     { ok: true, errors: [] },
        route:       { ok: true, errors: [] },
        rooms:       { ok: true, errors: [] },
        mutations:   { ok: true, errors: [] },
        determinism: { ok: true, errors: [] },
        safety:      { ok: true, errors: [] },
        overall_ok:  true
    };

    // ------------------------------------------------------------
    // 1. FUNCTION INVARIANTS (resolved coord function)
    // ------------------------------------------------------------

    if (!func || typeof func !== "object") {
        report.function.ok = false;
        report.function.errors.push("runtimePlan.func must be a plain object");
    } else {
        if (typeof func.name !== "string" || !func.name.length) {
            report.function.ok = false;
            report.function.errors.push("func.name must be a non-empty string");
        }

        if (func.expected_input &&
            typeof func.expected_input !== "string") {
            report.function.ok = false;
            report.function.errors.push("func.expected_input must be a string when present");
        }

        if (func.expected_output &&
            typeof func.expected_output !== "string") {
            report.function.ok = false;
            report.function.errors.push("func.expected_output must be a string when present");
        }

        if (func.allowed_mutations &&
            !Array.isArray(func.allowed_mutations)) {
            report.function.ok = false;
            report.function.errors.push("func.allowed_mutations must be an array when present");
        }
    }

    // ------------------------------------------------------------
    // 2. CARRIER INVARIANTS
    // ------------------------------------------------------------

    if (!carrier || typeof carrier !== "object") {
        report.carrier.ok = false;
        report.carrier.errors.push("carrier must be a plain object");
    }

    // ------------------------------------------------------------
    // 3. REPRESENTATION INVARIANTS
    // ------------------------------------------------------------

    if (func && typeof func === "object") {
        const expected = func.expected_input;

        if (expected) {
            if (!(expected in carrier)) {
                report.representation.ok = false;
                report.representation.errors.push(
                    `carrier is missing expected input representation "${expected}"`
                );
            } else {
                const value = carrier[expected];

                switch (expected) {
                    case "raw":
                    case "text":
                        if (typeof value !== "string") {
                            report.representation.ok = false;
                            report.representation.errors.push(
                                `carrier["${expected}"] must be a string`
                            );
                        }
                        break;

                    case "parsed":
                        if (!(value === null || typeof value === "object")) {
                            report.representation.ok = false;
                            report.representation.errors.push(
                                'carrier["parsed"] must be null or a plain object'
                            );
                        }
                        break;

                    case "extracted":
                        if (!(value && typeof value === "object")) {
                            report.representation.ok = false;
                            report.representation.errors.push(
                                'carrier["extracted"] must be a plain object'
                            );
                        }
                        break;

                    case "atoms":
                        if (!Array.isArray(value)) {
                            report.representation.ok = false;
                            report.representation.errors.push(
                                'carrier["atoms"] must be an array'
                            );
                        }
                        break;

                    case "tokens":
                        if (!Array.isArray(value)) {
                            report.representation.ok = false;
                            report.representation.errors.push(
                                'carrier["tokens"] must be an array'
                            );
                        }
                        break;

                    default:
                        // unknown representation: just require it to exist
                        break;
                }
            }
        }
    }

    // ------------------------------------------------------------
    // 4. ROUTE INVARIANTS
    // ------------------------------------------------------------

    if (!route || !Array.isArray(route)) {
        report.route.ok = false;
        report.route.errors.push("runtimePlan.route must be an array of rooms");
    } else if (route.length === 0) {
        report.route.ok = false;
        report.route.errors.push("runtimePlan.route must contain at least one room");
    }

    // ------------------------------------------------------------
    // 5. ROOM CONTRACT INVARIANTS
    // ------------------------------------------------------------

    if (Array.isArray(route)) {
        for (let i = 0; i < route.length; i++) {
            const room = route[i];

            if (!room || typeof room !== "object") {
                report.rooms.ok = false;
                report.rooms.errors.push(`route[${i}] must be a plain object`);
                break;
            }

            if (typeof room.id !== "string" || !room.id.length) {
                report.rooms.ok = false;
                report.rooms.errors.push(`route[${i}].id must be a non-empty string`);
                break;
            }

            if (typeof room.name !== "string" || !room.name.length) {
                report.rooms.ok = false;
                report.rooms.errors.push(`route[${i}].name must be a non-empty string`);
                break;
            }

            if (typeof room.handler !== "function") {
                report.rooms.ok = false;
                report.rooms.errors.push(`route[${i}].handler must be a function`);
                break;
            }
        }
    }

    // ------------------------------------------------------------
    // 6. MUTATION INVARIANTS (config-level)
    // ------------------------------------------------------------

    if (func && Array.isArray(func.allowed_mutations)) {
        for (const field of func.allowed_mutations) {
            if (typeof field !== "string") {
                report.mutations.ok = false;
                report.mutations.errors.push(
                    "func.allowed_mutations must contain only strings"
                );
                break;
            }

            // forbid dangerous mutation targets by config
            if (field === "metadata" ||
                field === "registries" ||
                field === "route" ||
                field === "workflowContext") {
                report.mutations.ok = false;
                report.mutations.errors.push(
                    `Mutation of "${field}" is not allowed in runtime`
                );
                break;
            }
        }
    }

    // ------------------------------------------------------------
    // 7. DETERMINISM INVARIANTS (config-level)
    // ------------------------------------------------------------

    if (func && typeof func === "object") {
        if (func.nondeterministic === true) {
            report.determinism.ok = false;
            report.determinism.errors.push(
                "func.nondeterministic must not be true for runtime"
            );
        }
    }

    // ------------------------------------------------------------
    // 8. SAFETY INVARIANTS (config-level)
    // ------------------------------------------------------------

    if (func && typeof func === "object") {
        if (func.allow_side_effects === true) {
            report.safety.ok = false;
            report.safety.errors.push(
                "func.allow_side_effects must not be true for runtime"
            );
        }
    }

    // ------------------------------------------------------------
    // OVERALL
    // ------------------------------------------------------------

    report.overall_ok = Object.values(report)
        .filter(section => typeof section === "object" && "ok" in section)
        .every(section => section.ok);

    return report;
}
