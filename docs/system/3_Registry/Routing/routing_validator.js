// 3_Registry/Routing/routing_validator.js

export function validateRoutingEntry(entry, schema) {
  // 1. Ensure required fields exist
  const required = ["id", "source", "target", "conditions", "transitions", "profile"];
  for (const field of required) {
    if (!(field in entry)) {
      throw new Error(`Routing entry missing required field: ${field} (id: ${entry.id})`);
    }
  }

  // 2. Validate types
  if (typeof entry.id !== "string") throw new Error(`Invalid id type in ${entry.id}`);
  if (typeof entry.source !== "string") throw new Error(`Invalid source type in ${entry.id}`);
  if (entry.target !== null && typeof entry.target !== "string")
    throw new Error(`Invalid target type in ${entry.id}`);
  if (!Array.isArray(entry.conditions))
    throw new Error(`Invalid conditions array in ${entry.id}`);
  if (!Array.isArray(entry.transitions))
    throw new Error(`Invalid transitions array in ${entry.id}`);
  if (typeof entry.profile !== "string")
    throw new Error(`Invalid profile type in ${entry.id}`);

  // 3. Schema-level validation (optional but clean)
  if (schema && schema.properties) {
    for (const key of Object.keys(entry)) {
      if (!schema.properties[key]) {
        console.warn(`Warning: Unknown routing field "${key}" in ${entry.id}`);
      }
    }
  }

  return true;
}
