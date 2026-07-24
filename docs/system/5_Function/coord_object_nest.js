export const id = "coord_object_nest";

export function behavior(input, state) {
  const output = { type: "object_nest", payload: input };
  return { output, state };
}
