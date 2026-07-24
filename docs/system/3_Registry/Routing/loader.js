// system/3_Registry/Routing/loader.js
// Browser‑safe routing loader. No Node, no fs, no directory scanning.

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }
  return res.json();
}

export async function loadRoutingRegistry() {
  // Load the routing schema (single JSON file)
  const routingSchema = await loadJSON("./routing_schema.json");

  // Load transitions (single JSON file or a known list)
  // Browser cannot scan directories, so transitions must be explicit.
  const transitions = await loadJSON("./transitions.json");

  // Validate each transition against the schema
  for (const entry of transitions) {
    validateRoutingEntry(entry, routingSchema);
  }

  return {
    schema: routingSchema,
    transitions
  };
}
