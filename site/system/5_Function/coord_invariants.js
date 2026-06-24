// system/5_Function/coord_invariants.js

import { runAllNamingInvariants } from "./validators/run_all_naming_invariants.js";
import { runAllCoordinateInvariants } from "./validators/run_all_coordinate_invariants.js";
import { runAllMetadataInvariants } from "./validators/run_all_metadata_invariants.js";
import { runAllSKUInvariants } from "./validators/run_all_sku_invariants.js";
import { runAllPlacementInvariants } from "./validators/run_all_placement_invariants.js";
import { runAllRoutingInvariants } from "./validators/run_all_routing_invariants.js";

import { runAllPreprocessInvariants } from "./validators/run_all_preprocess_invariants.js";
import { runAllAtomizeInvariants } from "./validators/run_all_atomize_invariants.js";
import { runAllRuntimeInvariants } from "./validators/run_all_runtime_invariants.js";
import { runAllPostprocessInvariants } from "./validators/run_all_postprocess_invariants.js";

import { buildPath } from "../1_Engine/path_builder.js";

export async function coord_invariants({ workflowContext, carrier }) {

    const hotelRoot = workflowContext["coord_hotel_root"];

    // REQUIRE: hotel_root must have run
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "invariants_error",
            metadata_id: null,
            invariants_report: {
                pass: carrier?.pass ?? 1,
                overall_ok: false,
                severity: "hard",
                category: "structure",
                domain: null,
                reason: "Hotel Root has not run yet",
                reports: {}
            },
            next_path: null
        };
    }

    const metadataId = hotelRoot.metadata_id;
    const domain = carrier?.domain || null;
    const pass = carrier?.pass ?? 1;
    const payload = carrier.payload || {};

    // Registries
    const canonicalRegistry = workflowContext["canonical_registry"];
    const aliasRegistry = workflowContext["alias_registry"];
    const coordinateRegistry = workflowContext["coordinate_registry"];
    const metadataRegistry = workflowContext["metadata_registry"];
    const skuRegistry = workflowContext["sku_registry"];
    const placementRegistry = workflowContext["placement_registry"];
    const routingRegistry = workflowContext["routing_registry"];
    const shell = workflowContext["coord_hotel_shell"];

    // ------------------------------------------------------------
    // PASS 1 — PREPROCESS DOMAIN → invariants + route build
    // ------------------------------------------------------------
    if (domain === "preprocess" && pass === 1) {

        //
        // 1. OBJECT REGISTRY PASS 1
        //
        const namingReport = await runAllNamingInvariants(canonicalRegistry, aliasRegistry);
        const coordinateReport = await runAllCoordinateInvariants(coordinateRegistry);
        const metadataReport = await runAllMetadataInvariants(metadataRegistry, skuRegistry);
        const skuReport = await runAllSKUInvariants(skuRegistry, coordinateRegistry, metadataRegistry);
        const placementReport = await runAllPlacementInvariants(placementRegistry, coordinateRegistry);

        const objectRegistryReports = {
            naming: namingReport,
            coordinates: coordinateReport,
            metadata: metadataReport,
            sku: skuReport,
            placement: placementReport
        };

        const object_registry_ok = Object.values(objectRegistryReports)
            .every(r => r.overall_ok === true);


        //
        // 2. PREPROCESS INVARIANTS
        //
        const preprocessReport = runAllPreprocessInvariants(carrier, {
            canonicalRegistry,
            coordinateRegistry,
            metadataRegistry,
            skuRegistry
        });

        const preprocess_ok = preprocessReport.overall_ok;


        //
        // 3. STATE MACHINE GATE
        //
        const state_machine_ok = object_registry_ok && preprocess_ok;

        const stateMachineReport = {
            overall_ok: state_machine_ok,
            errors: []
        };


        //
        // 4. OVERALL PASS 1 RESULT
        //
        const overall_ok = object_registry_ok &&
                           preprocess_ok &&
                           state_machine_ok;


        //
        // 5. SEVERITY + DOMAIN + CATEGORY + REASON
        //
        let severity = "none";
        let reportDomain = null;
        let category = "registry";
        let reason = null;

        if (!overall_ok) {

            // object_registry failures
            if (!object_registry_ok) {
                for (const [key, report] of Object.entries(objectRegistryReports)) {
                    if (!report.overall_ok) {
                        reportDomain = "object_registry";
                        reason = report.errors?.[0] || "Object registry invariant failed";

                        if (key === "coordinates" || key === "placement") {
                            severity = "hard";
                            category = key === "placement" ? "geometry" : "registry";
                        } else {
                            severity = "soft";
                            category = "registry";
                        }
                        break;
                    }
                }
            }

            // preprocess failures
            else if (!preprocess_ok) {
                reportDomain = "preprocess";
                reason =
                    preprocessReport.structure.errors[0] ||
                    preprocessReport.registry.errors[0] ||
                    preprocessReport.semantics.errors[0] ||
                    preprocessReport.geometry.errors[0] ||
                    preprocessReport.engine.errors[0] ||
                    "Preprocess invariants failed";

                if (!preprocessReport.semantics.ok || !preprocessReport.geometry.ok) {
                    severity = "hard";
                    category = !preprocessReport.semantics.ok ? "semantics" : "geometry";
                } else {
                    severity = "soft";
                    category = "structure";
                }
            }

            // state machine failures
            else if (!state_machine_ok) {
                reportDomain = "state_machine";
                reason = "State machine structural requirements not met";
                severity = "hard";
                category = "structure";
            }
        }


        //
        // 6. ROUTE BUILDING GATE
        //
        let routeBuilt = false;

        if (overall_ok) {
            const route = buildPath({
                metadata: metadataRegistry,
                structural: {
                    allowed_parents: shell?.allowed_parents,
                    allowed_children: shell?.allowed_children,
                    constraints: shell?.constraints,
                    invariants: shell?.invariants
                }
            });

            payload.path = route.path;
            routeBuilt = true;
        }


        //
        // 7. RETURN PASS 1 REPORT
        //
        return {
            phase: "invariants_pass_1",
            metadata_id: metadataId,
            invariants_report: {
                pass: 1,
                overall_ok,
                severity,
                category,
                domain: reportDomain,
                reason,
                route_built: routeBuilt,
                reports: {
                    object_registry: objectRegistryReports,
                    preprocess: preprocessReport,
                    state_machine: stateMachineReport
                }
            },
            next_path: null
        };
    }

    // ------------------------------------------------------------
    // ATOMIZE DOMAIN — linguistic-form invariants
    // ------------------------------------------------------------
    if (domain === "atomize") {

        const atomizeReport = runAllAtomizeInvariants(carrier);
        const atomize_ok = atomizeReport.overall_ok;

        let severity = "none";
        let category = "structure";
        let reason = null;

        if (!atomize_ok) {
            reason =
                atomizeReport.atomicity.errors[0] ||
                atomizeReport.structure.errors[0] ||
                atomizeReport.semantics.errors[0] ||
                atomizeReport.determinism.errors[0] ||
                atomizeReport.linguistic.errors[0] ||
                "Atomize invariants failed";

            if (!atomizeReport.semantics.ok || !atomizeReport.linguistic.ok) {
                severity = "hard";
                category = !atomizeReport.semantics.ok ? "semantics" : "linguistic";
            } else {
                severity = "soft";
                category = "structure";
            }
        }

        return {
            phase: pass === 1 ? "invariants_pass_1" : "invariants_pass_2",
            metadata_id: metadataId,
            invariants_report: {
                pass,
                overall_ok: atomize_ok,
                severity,
                category,
                domain: "atomize",
                reason,
                reports: {
                    atomize: atomizeReport
                }
            },
            next_path: null
        };
    }

    // ------------------------------------------------------------
    // PASS 2 — ROUTE DOMAIN → full invariants including routing
    // ------------------------------------------------------------
    if (domain === "route" && pass === 2) {

        //
        // 1. OBJECT REGISTRY PASS 2
        //
        const namingReport = await runAllNamingInvariants(canonicalRegistry, aliasRegistry);
        const coordinateReport = await runAllCoordinateInvariants(coordinateRegistry);
        const metadataReport = await runAllMetadataInvariants(metadataRegistry, skuRegistry);
        const skuReport = await runAllSKUInvariants(skuRegistry, coordinateRegistry, metadataRegistry);
        const placementReport = await runAllPlacementInvariants(placementRegistry, coordinateRegistry);

        const objectRegistryReports = {
            naming: namingReport,
            coordinates: coordinateReport,
            metadata: metadataReport,
            sku: skuReport,
            placement: placementReport
        };

        const object_registry_ok = Object.values(objectRegistryReports)
            .every(r => r.overall_ok === true);


        //
        // 2. PREPROCESS SERVICE PASS 2
        //
        const carrierStruct = carrier || {};
        const rawOk = typeof carrierStruct.raw === "string";
        const textOk = typeof carrierStruct.text === "string";
        const parsedOk = carrierStruct.parsed === null ||
                         typeof carrierStruct.parsed === "object";
        const extractedOk = carrierStruct.extracted &&
                            typeof carrierStruct.extracted === "object";

        const preprocess_service_ok = rawOk && textOk && parsedOk && extractedOk;

        const preprocessServiceReport = {
            overall_ok: preprocess_service_ok,
            errors: []
        };


        //
        // 3. STATE MACHINE PASS 2
        //
        const state_machine_ok = object_registry_ok && preprocess_service_ok;

        const stateMachineReport = {
            overall_ok: state_machine_ok,
            errors: []
        };


        //
        // 4. ROUTING PASS 2
        //
        const routingReport = await runAllRoutingInvariants(
            routingRegistry,
            canonicalRegistry,
            coordinateRegistry
        );

        const routing_ok = routingReport.overall_ok === true;


        //
        // 5. OVERALL PASS 2 RESULT
        //
        const overall_ok = object_registry_ok &&
                           preprocess_service_ok &&
                           state_machine_ok &&
                           routing_ok;


        //
        // 6. SEVERITY + DOMAIN + CATEGORY + REASON
        //
        let severity = "none";
        let reportDomain = null;
        let category = "registry";
        let reason = null;

        if (!overall_ok) {

            if (!object_registry_ok) {
                for (const [key, report] of Object.entries(objectRegistryReports)) {
                    if (!report.overall_ok) {
                        reportDomain = "object_registry";
                        reason = report.errors?.[0] || "Object registry invariant failed";

                        if (key === "coordinates" || key === "placement") {
                            severity = "hard";
                            category = key === "placement" ? "geometry" : "registry";
                        } else {
                            severity = "soft";
                            category = "registry";
                        }
                        break;
                    }
                }
            }

            else if (!preprocess_service_ok) {
                reportDomain = "preprocess_service";
                reason = "Preprocess carrier structure invalid";
                severity = "soft";
                category = "structure";
            }

            else if (!state_machine_ok) {
                reportDomain = "state_machine";
                reason = "State machine structural requirements not met";
                severity = "hard";
                category = "structure";
            }

            else if (!routing_ok) {
                reportDomain = "routing";
                reason = routingReport.errors?.[0] || "Routing invariant failed";
                severity = "hard";
                category = "engine";
            }
        }


        //
        // 7. RETURN PASS 2 REPORT
        //
        return {
            phase: "invariants_pass_2",
            metadata_id: metadataId,
            invariants_report: {
                pass: 2,
                overall_ok,
                severity,
                category,
                domain: reportDomain,
                reason,
                reports: {
                    object_registry: objectRegistryReports,
                    preprocess_service: preprocessServiceReport,
                    state_machine: stateMachineReport,
                    routing: routingReport
                }
            },
            next_path: null
        };
    }

    // ------------------------------------------------------------
    // RUNTIME DOMAIN — function-centric, representation-aware invariants
    // ------------------------------------------------------------
    if (domain === "runtime") {

        const func = metadataRegistry?.[metadataId]?.function || null;
        const route = payload?.path || null;

        const runtimePlan = { func, route };

        const runtimeReport = runAllRuntimeInvariants(carrier, runtimePlan);
        const runtime_ok = runtimeReport.overall_ok;

        let severity = "none";
        let category = "structure";
        let reason = null;

        if (!runtime_ok) {
            reason =
                runtimeReport.function.errors[0] ||
                runtimeReport.representation.errors[0] ||
                runtimeReport.carrier.errors[0] ||
                runtimeReport.route.errors[0] ||
                runtimeReport.rooms.errors[0] ||
                runtimeReport.mutations.errors[0] ||
                runtimeReport.determinism.errors[0] ||
                runtimeReport.safety.errors[0] ||
                "Runtime invariants failed";

            if (!runtimeReport.determinism.ok) {
                severity = "hard";
                category = "engine";
            } else {
                severity = "soft";
                category = "structure";
            }
        }

        return {
            phase: pass === 1 ? "invariants_pass_1" : "invariants_pass_2",
            metadata_id: metadataId,
            invariants_report: {
                pass,
                overall_ok: runtime_ok,
                severity,
                category,
                domain: "runtime",
                reason,
                reports: {
                    runtime: runtimeReport
                }
            },
            next_path: null
        };
    }

    // ------------------------------------------------------------
    // POSTPROCESS DOMAIN — output-structure, non-semantic, deterministic invariants
    // ------------------------------------------------------------
    if (domain === "postprocess") {

        const func = metadataRegistry?.[metadataId]?.function || null;

        const outputField = func?.expected_output || "postprocess_output";

        const postprocessPlan = { func, outputField };

        const postprocessReport = runAllPostprocessInvariants(carrier, postprocessPlan);
        const postprocess_ok = postprocessReport.overall_ok;

        let severity = "none";
        let category = "structure";
        let reason = null;

        if (!postprocess_ok) {
            reason =
                postprocessReport.structure.errors[0] ||
                postprocessReport.representation.errors[0] ||
                postprocessReport.semantics.errors[0] ||
                postprocessReport.determinism.errors[0] ||
                postprocessReport.safety.errors[0] ||
                postprocessReport.reversible.errors[0] ||
                "Postprocess invariants failed";

            if (!postprocessReport.semantics.ok || !postprocessReport.determinism.ok) {
                severity = "hard";
                category = !postprocessReport.semantics.ok ? "semantics" : "engine";
            } else {
                severity = "soft";
                category = "structure";
            }
        }

        return {
            phase: pass === 1 ? "invariants_pass_1" : "invariants_pass_2",
            metadata_id: metadataId,
            invariants_report: {
                pass,
                overall_ok: postprocess_ok,
                severity,
                category,
                domain: "postprocess",
                reason,
                reports: {
                    postprocess: postprocessReport
                }
            },
            next_path: null
        };
    }

    // Unknown domain fallback
    return {
        phase: pass === 1 ? "invariants_pass_1" : "invariants_pass_2",
        metadata_id: metadataId,
        invariants_report: {
            pass,
            overall_ok: false,
            severity: "hard",
            category: "structure",
            domain,
            reason: `Unknown invariants domain: ${domain}`,
            reports: {}
        },
        next_path: null
    };
}
