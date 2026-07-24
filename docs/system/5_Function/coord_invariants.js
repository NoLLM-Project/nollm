// system/5_Function/coord_invariants.js

import { runAllNamingInvariants } from "./validators/run_all_naming_invariants.js";
import { runAllCoordinateInvariants } from "./validators/run_all_coordinate_invariants.js";
import { runAllMetadataInvariants } from "./validators/run_all_metadata_invariants.js";
import { runAllSKUInvariants } from "./validators/run_all_sku_invariants.js";
import { loadSKURegistry } from "./validators/load_sku_registry.js";
import { runAllPlacementInvariants } from "./validators/run_all_placement_invariants.js";
import { runAllRoutingInvariants } from "./validators/run_all_routing_invariants.js";

import { runAllPreprocessInvariants } from "./validators/run_all_preprocess_invariants.js";
import { runAllAtomizeInvariants } from "./validators/run_all_atomize_invariants.js";
import { runAllRuntimeInvariants } from "./validators/run_all_runtime_invariants.js";
import { runAllPostprocessInvariants } from "./validators/run_all_postprocess_invariants.js";

import { buildPath } from "../1_Engine/path_builder.js";

export async function coord_invariants({ workflowContext, carrier }) {

    console.log("INVARIANTS RAN");
    console.log("INVARIANTS RECEIVED REQUEST:", workflowContext["coord_invariants_request"]);

    console.log("[PREPROCESS] invariants_entry:", {
        domain: workflowContext["coord_invariants_request"]?.domain,
        pass: workflowContext["coord_invariants_request"]?.pass,
        carrierKeys: Object.keys(carrier || {})
    });

    const hotelRoot = workflowContext["coord_hotel_root"];

    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "invariants_error",
            metadata_id: null,
            invariants_report: {
                pass: 1,
                overall_ok: false,
                severity: "hard",
                category: "structure",
                domain: "preprocess",
                reason: "Hotel Root has not run yet",
                reports: {}
            },
            next_path: "coord_front_desk"
        };
    }

    const metadataId = hotelRoot.metadata_id;

    const invState = workflowContext["coord_invariants_request"] || {};
    const domain = carrier?.domain ?? invState.domain ?? "preprocess";
    const pass = carrier?.pass ?? invState.pass ?? 1;

    if (domain === "preprocess" && !workflowContext["coord_preprocess_service"]) {
        console.log("[PREPROCESS] preprocess skipped — service did not run");
        return {
            phase: "invariants_skipped_preprocess",
            metadata_id: metadataId,
            invariants_report: null,
            next_path: "coord_front_desk"
        };
    }

    const payload =
        workflowContext["coord_preprocess_service"]?.payload ||
        workflowContext["coord_atomize_service"]?.payload ||
        workflowContext["coord_runtime_request"]?.payload ||
        workflowContext["coord_postprocess_service"]?.payload ||
        {};

    // ⭐ Ensure SKU registry exists
    if (!workflowContext["sku_registry"]) {
        workflowContext["sku_registry"] = await loadSKURegistry();
    }

    const canonicalRegistry = workflowContext["canonical_registry"];
    const aliasRegistry = workflowContext["alias_registry"];
    const coordinateRegistry = workflowContext["coordinate_registry"];
    const metadataRegistry = workflowContext["metadata_registry"];
    const skuRegistry = workflowContext["sku_registry"];
    const placementRegistry = workflowContext["placement_registry"];
    const routingRegistry = workflowContext["routing_registry"];
    const shell = workflowContext["coord_hotel_shell"];

    // ------------------------------------------------------------
    // ⭐ PREPROCESS PASS 1
    // ------------------------------------------------------------
    if (domain === "preprocess" && pass === 1) {

        console.log("[PREPROCESS] PASS 1 starting:", {
            payloadKeys: Object.keys(payload || {}),
            aliasRegistryKeys: Object.keys(aliasRegistry || {})
        });

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

        const preprocessReport = runAllPreprocessInvariants(payload, {
            canonicalRegistry,
            coordinateRegistry,
            metadataRegistry,
            skuRegistry
        });

        const preprocess_ok = preprocessReport.overall_ok;

        const overall_ok = object_registry_ok && preprocess_ok;

        // ⭐ AUTHORITATIVE FAILURE LOG — PASS 1
        if (!overall_ok) {
            console.log("[INVARIANTS][PREPROCESS][PASS 1][FAILURE] Detailed failure report:");

            console.log("  object_registry_ok:", object_registry_ok);
            console.log("  preprocess_ok:", preprocess_ok);

            console.log("  objectRegistryReports:", {
                naming: namingReport,
                coordinates: coordinateReport,
                metadata: metadataReport,
                sku: skuReport,
                placement: placementReport
            });

            console.log("  preprocessReport:", preprocessReport);

            console.log("  canonicalRegistry keys:", Object.keys(canonicalRegistry || {}));
            console.log("  aliasRegistry keys:", Object.keys(aliasRegistry || {}));
            console.log("  coordinateRegistry keys:", Object.keys(coordinateRegistry || {}));
            console.log("  metadataRegistry keys:", Object.keys(metadataRegistry || {}));
            console.log("  skuRegistry keys:", Object.keys(skuRegistry || {}));
            console.log("  placementRegistry keys:", Object.keys(placementRegistry || {}));

            console.log("  payload keys:", Object.keys(payload || {}));
        }

        let severity = "none";
        let category = "registry";
        let reason = null;

        if (!overall_ok) {
            if (!object_registry_ok) {
                for (const [key, report] of Object.entries(objectRegistryReports)) {
                    if (!report.overall_ok) {
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
            } else if (!preprocess_ok) {
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
        }

        const aliasExists = aliasRegistry && Object.keys(aliasRegistry).length > 0;

        let routeBuilt = false;

        if (overall_ok && aliasExists) {
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

        console.log("[PREPROCESS] PASS 1 route_build_attempt:", {
            overall_ok,
            aliasExists,
            routeBuilt,
            builtPath: payload.path
        });

        console.log("[PREPROCESS] PASS 1 result:", {
            overall_ok,
            severity,
            category,
            reason,
            routeBuilt
        });

        console.log("[PREPROCESS] PASS 1 next_path:", "coord_front_desk");

        return {
            phase: "invariants_pass_1",
            metadata_id: metadataId,
            invariants_report: {
                pass: 1,
                overall_ok,
                severity,
                category,
                domain: "preprocess",
                reason,
                route_built: routeBuilt,
                reports: {
                    object_registry: objectRegistryReports,
                    preprocess: preprocessReport
                }
            },
            next_path: "coord_front_desk"
        };
    }

    // ------------------------------------------------------------
    // ⭐ PREPROCESS PASS 2
    // ------------------------------------------------------------
    if (domain === "preprocess" && pass === 2) {

        console.log("[PREPROCESS] PASS 2 starting:", {
            payloadKeys: Object.keys(payload || {}),
            rawOk: typeof payload.raw === "string",
            textOk: typeof payload.text === "string",
            parsedOk: payload.parsed === null || typeof payload.parsed === "object",
            extractedOk: payload.extracted && typeof payload.extracted === "object"
        });

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

        const rawOk = typeof payload.raw === "string";
        const textOk = typeof payload.text === "string";
        const parsedOk = payload.parsed === null || typeof payload.parsed === "object";
        const extractedOk = payload.extracted && typeof payload.extracted === "object";

        const preprocess_service_ok = rawOk && textOk && parsedOk && extractedOk;

        const preprocessServiceReport = {
            overall_ok: preprocess_service_ok,
            errors: preprocess_service_ok ? [] : ["Preprocess carrier structure invalid"]
        };

        const routingReport = await runAllRoutingInvariants(
            routingRegistry,
            canonicalRegistry,
            coordinateRegistry
        );

        const routing_ok = routingReport.overall_ok === true;

        const overall_ok =
            object_registry_ok &&
            preprocess_service_ok &&
            routing_ok;

        // ⭐ AUTHORITATIVE FAILURE LOG — PASS 2
        if (!overall_ok) {
            console.log("[INVARIANTS][PREPROCESS][PASS 2][FAILURE] Detailed failure report:");

            console.log("  object_registry_ok:", object_registry_ok);
            console.log("  preprocess_service_ok:", preprocess_service_ok);
            console.log("  routing_ok:", routing_ok);

            console.log("  objectRegistryReports:", {
                naming: namingReport,
                coordinates: coordinateReport,
                metadata: metadataReport,
                sku: skuReport,
                placement: placementReport
            });

            console.log("  preprocessServiceReport:", preprocessServiceReport);
            console.log("  routingReport:", routingReport);

            console.log("  canonicalRegistry keys:", Object.keys(canonicalRegistry || {}));
            console.log("  aliasRegistry keys:", Object.keys(aliasRegistry || {}));
            console.log("  coordinateRegistry keys:", Object.keys(coordinateRegistry || {}));
            console.log("  metadataRegistry keys:", Object.keys(metadataRegistry || {}));
            console.log("  skuRegistry keys:", Object.keys(skuRegistry || {}));
            console.log("  placementRegistry keys:", Object.keys(placementRegistry || {}));
            console.log("  routingRegistry keys:", Object.keys(routingRegistry || {}));

            console.log("  payload keys:", Object.keys(payload || {}));
        }

        let severity = "none";
        let category = "registry";
        let reason = null;

        if (!overall_ok) {
            if (!object_registry_ok) {
                for (const [key, report] of Object.entries(objectRegistryReports)) {
                    if (!report.overall_ok) {
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
            } else if (!preprocess_service_ok) {
                reason = "Preprocess carrier structure invalid";
                severity = "soft";
                category = "structure";
            } else if (!routing_ok) {
                const routingErrors = routingReport.errors || [];
                reason = routingErrors[0] || routingReport.reason || "Routing invariant failed";
                severity = "hard";
                category = "engine";
            }
        }

        console.log("[PREPROCESS] PASS 2 result:", {
            overall_ok,
            severity,
            category,
            reason
        });

        return {
            phase: "invariants_pass_2",
            metadata_id: metadataId,
            invariants_report: {
                pass: 2,
                overall_ok,
                severity,
                category,
                domain: "preprocess",
                reason,
                reports: {
                    object_registry: objectRegistryReports,
                    preprocess_service: preprocessServiceReport,
                    routing: routingReport
                }
            },
            next_path: "coord_front_desk"
        };
    }

    // ------------------------------------------------------------
    // ATOMIZE DOMAIN — PASS 1 OR 2
    // ------------------------------------------------------------
    if (domain === "atomize") {

        const atomizePayload = {
            tokens: workflowContext["coord_tokenize_text"]?.result,
            atoms: workflowContext["coord_match_phrases"]?.payload?.atoms ??
                   workflowContext["coord_resolve_atoms"]?.payload?.atoms,
            chunks: workflowContext["coord_normalize_chunks"]?.payload?.chunks ??
                    workflowContext["coord_match_chunks"]?.payload?.chunks,
            clauses: workflowContext["coord_segment_clauses"]?.payload?.clauses,
            sentence: workflowContext["coord_assemble_sentence"]?.payload?.sentence
        };

        const atomizeReport = await runAllAtomizeInvariants(atomizePayload);

        const atomicity   = atomizeReport.atomicity   || { ok: false, errors: ["Missing atomicity report"] };
        const structure   = atomizeReport.structure   || { ok: false, errors: ["Missing structure report"] };
        const semantics   = atomizeReport.semantics   || { ok: false, errors: ["Missing semantics report"] };
        const determinism = atomizeReport.determinism || { ok: false, errors: ["Missing determinism report"] };
        const linguistic  = atomizeReport.linguistic  || { ok: false, errors: ["Missing linguistic report"] };

        function safeErr(section) {
            return section && Array.isArray(section.errors) && section.errors.length > 0
                ? section.errors[0]
                : null;
        }

        const atomize_ok =
            atomicity.ok &&
            structure.ok &&
            semantics.ok &&
            determinism.ok &&
            linguistic.ok;

        let severity = "none";
        let category = "structure";
        let reason = null;

        if (!atomize_ok) {
            reason =
                safeErr(atomicity) ||
                safeErr(structure) ||
                safeErr(semantics) ||
                safeErr(determinism) ||
                safeErr(linguistic) ||
                "Atomize invariants failed";

            if (!semantics.ok || !linguistic.ok) {
                severity = "hard";
                category = !semantics.ok ? "semantics" : "linguistic";
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
            next_path: "coord_front_desk"
        };
    }

    // ------------------------------------------------------------
    // RUNTIME DOMAIN
    // ------------------------------------------------------------
    if (domain === "runtime") {

        const func = metadataRegistry?.[metadataId]?.function || null;
        const route = payload?.path || null;

        const runtimePlan = { func, route };

        const runtimeReport = runAllRuntimeInvariants(payload, runtimePlan);
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
            next_path: "coord_front_desk"
        };
    }

    // ------------------------------------------------------------
    // POSTPROCESS DOMAIN
    // ------------------------------------------------------------
    if (domain === "postprocess") {

        const func = metadataRegistry?.[metadataId]?.function || null;

        const outputField = func?.expected_output || "postprocess_output";

        const postprocessPlan = { func, outputField };

        const postprocessReport = runAllPostprocessInvariants(payload, postprocessPlan);
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
            next_path: "coord_front_desk"
        };
    }

    // ------------------------------------------------------------
    // UNKNOWN DOMAIN FALLBACK
    // ------------------------------------------------------------
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
        next_path: "coord_front_desk"
    };
}
