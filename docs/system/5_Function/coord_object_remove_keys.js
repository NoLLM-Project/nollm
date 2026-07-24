export const id = "coord_object_remove_keys";

export function behavior(input, state) {
  const output = { type: "object_remove_keys", payload: input };
  return { output, state };
}
