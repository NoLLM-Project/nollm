import { loadJson } from "../../../utils/loadJson.js";

export async function loadRoutingInvariants() {
    return await loadJson("../../3_Registry/Routing/routing_invariants.json");
}
