export const id = "coord_object_sort_keys";

export function behavior(input, state) {
  const output = { type: "object_sort_keys", payload: input };
  return { output, state };
}
