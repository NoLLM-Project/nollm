// system/5_Function/coord_invariants.js

import { runAllNamingInvariants } from "./validators/run_all_naming_invariants.js";
import { runAllCoordinateInvariants } from "./validators/run_all_coordinate_invariants.js";
import { runAllMetadataInvariants } from "./validators/run_all_metadata_invariants.js";
import { runAllSKUInvariants } from "./validators/run_all_sku_invariants.js";
import { runAllPlacementInvariants } from "./validators/run_all_placement_invariants.js";
import { runAllRoutingInvariants } from "./validators/run_all_routing_invariants.js";

import { buildPath } from "../1_Engine/path_builder.js";

export function coord_invariants({ workflowContext, carrier }) {

    const hotelRoot = workflowContext["coord_hotel_root"];

    // REQUIRE: hotel_root must have run
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "invariants",
            error: "Hotel Root has not run yet",
            metadata_id: null,
            invariants_report: null,
            next_path: null
        };
    }

    const metadataId = hotelRoot.metadata_id;
    const payload = carrier.payload || {};

    // Load registries
    const canonicalRegistry = workflowContext["canonical_registry"];
    const coordinateRegistry = workflowContext["coordinate_registry"];
    const metadataRegistry = workflowContext["metadata_registry"];
    const skuRegistry = workflowContext["sku_registry"];
    const placementRegistry = workflowContext["placement_registry"];
    const routingRegistry = workflowContext["routing_registry"];

    // ------------------------------------------------------------
    // PASS 1 — path missing → object-only invariants, NO route build yet
    // ------------------------------------------------------------
    if (!payload.path) {

        //
        // 1. OBJECT REGISTRY PASS 1
        //
        const namingReport = runAllNamingInvariants(canonicalRegistry);
        const coordinateReport = runAllCoordinateInvariants(coordinateRegistry);
        const metadataReport = runAllMetadataInvariants(metadataRegistry);
        const skuReport = runAllSKUInvariants(skuRegistry);
        const placementReport = runAllPlacementInvariants(placementRegistry, coordinateRegistry);

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
        // 2. PREPROCESS SERVICE PASS 1
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
        // 3. STATE MACHINE PASS 1
        //
        const state_machine_ok = object_registry_ok && preprocess_service_ok;

        const stateMachineReport = {
            overall_ok: state_machine_ok,
            errors: []
        };


        //
        // 4. OVERALL PASS 1 RESULT
        //
        const overall_ok = object_registry_ok &&
                           preprocess_service_ok &&
                           state_machine_ok;


        //
        // 5. SEVERITY + DOMAIN + REASON
        //
        let severity = "none";
        let domain = null;
        let reason = null;

        if (!overall_ok) {

            // 1. object_registry failures
            if (!object_registry_ok) {
                for (const [key, report] of Object.entries(objectRegistryReports)) {
                    if (!report.overall_ok) {
                        domain = "object_registry";
                        reason = report.errors?.[0] || "Object registry invariant failed";

                        if (key === "coordinates" || key === "placement") {
                            severity = "hard";
                        } else {
                            severity = "soft";
                        }
                        break;
                    }
                }
            }

            // 2. preprocess_service failures
            else if (!preprocess_service_ok) {
                domain = "preprocess_service";
                reason = "Preprocess carrier structure invalid";
                severity = "soft";
            }

            // 3. state_machine failures
            else if (!state_machine_ok) {
                domain = "state_machine";
                reason = "State machine structural requirements not met";
                severity = "hard";
            }
        }


        //
        // 6. ROUTE BUILDING GATE
        //
        let routeBuilt = false;

        if (overall_ok) {
            const shell = workflowContext["coord_hotel_shell"];

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
                domain,
                reason,
                route_built: routeBuilt,
                reports: {
                    object_registry: objectRegistryReports,
                    preprocess_service: preprocessServiceReport,
                    state_machine: stateMachineReport
                }
            },
            next_path: null
        };
    }

    // ------------------------------------------------------------
    // PASS 2 — path present → full invariants including routing
    // ------------------------------------------------------------

    //
    // 1. OBJECT REGISTRY PASS 2
    //
    const namingReport = runAllNamingInvariants(canonicalRegistry);
    const coordinateReport = runAllCoordinateInvariants(coordinateRegistry);
    const metadataReport = runAllMetadataInvariants(metadataRegistry);
    const skuReport = runAllSKUInvariants(skuRegistry);
    const placementReport = runAllPlacementInvariants(placementRegistry, coordinateRegistry);

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
    const routingReport = runAllRoutingInvariants(
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
    // 6. SEVERITY + DOMAIN + REASON
    //
    let severity = "none";
    let domain = null;
    let reason = null;

    if (!overall_ok) {

        if (!object_registry_ok) {
            for (const [key, report] of Object.entries(objectRegistryReports)) {
                if (!report.overall_ok) {
                    domain = "object_registry";
                    reason = report.errors?.[0] || "Object registry invariant failed";

                    if (key === "coordinates" || key === "placement") {
                        severity = "hard";
                    } else {
                        severity = "soft";
                    }
                    break;
                }
            }
        }

        else if (!preprocess_service_ok) {
            domain = "preprocess_service";
            reason = "Preprocess carrier structure invalid";
            severity = "soft";
        }

        else if (!state_machine_ok) {
            domain = "state_machine";
            reason = "State machine structural requirements not met";
            severity = "hard";
        }

        else if (!routing_ok) {
            domain = "routing";
            reason = routingReport.errors?.[0] || "Routing invariant failed";
            severity = "hard";
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
            domain,
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
