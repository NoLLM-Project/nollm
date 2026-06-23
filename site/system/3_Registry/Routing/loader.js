import { loadJson } from "../../../utils/load_json.js"; // or correct absolute path

export async function loadRoutingRegistry() {
  const basePath = "/3_Registry/Routing/transitions";

  // Load schema via fetch, not import
  const routingSchema = await loadJson("/3_Registry/Routing/routing_schema.json");

  const allTransitions = readJsonFilesRecursively(basePath);
  const transitions = allTransitions.flat();

  for (const entry of transitions) {
    validateRoutingEntry(entry, routingSchema);
  }

  // duplicate ID check...
}
