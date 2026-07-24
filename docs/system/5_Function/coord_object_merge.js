export const id = "coord_object_merge";

export function behavior(input, state) {
  const output = { type: "object_merge", payload: input };
  return { output, state };
}
