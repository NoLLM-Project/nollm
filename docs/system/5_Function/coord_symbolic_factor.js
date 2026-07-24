export const id = "coord_symbolic_factor";

export function behavior(input, state) {
  const output = { type: "symbolic_factor", payload: input };
  return { output, state };
}
