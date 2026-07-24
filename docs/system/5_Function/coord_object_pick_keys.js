export const id = "coord_object_pick_keys";

export function behavior(input, state) {
  const output = { type: "object_pick_keys", payload: input };
  return { output, state };
}
