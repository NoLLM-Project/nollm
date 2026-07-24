export const id = "coord_object_map_values";

export function behavior(input, state) {
  const output = { type: "object_map_values", payload: input };
  return { output, state };
}
