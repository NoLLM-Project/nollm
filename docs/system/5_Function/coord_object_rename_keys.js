export const id = "coord_object_rename_keys";

export function behavior(input, state) {
  const output = { type: "object_rename_keys", payload: input };
  return { output, state };
}
