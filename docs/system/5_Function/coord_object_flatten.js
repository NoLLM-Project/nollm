export const id = "coord_object_flatten";

export function behavior(input, state) {
  const output = { type: "object_flatten", payload: input };
  return { output, state };
}
