export const id = "coord_symbolic_expand";

export function behavior(input, state) {
  const output = { type: "symbolic_expand", payload: input };
  return { output, state };
}
