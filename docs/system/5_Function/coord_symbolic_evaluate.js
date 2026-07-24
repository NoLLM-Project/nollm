export const id = "coord_symbolic_evaluate";

export function behavior(input, state) {
  const output = { type: "symbolic_evaluate", payload: input };
  return { output, state };
}
