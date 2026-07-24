export const id = "coord_symbolic_simplify";

export function behavior(input, state) {
  const output = { type: "symbolic_simplify", payload: input };
  return { output, state };
}
