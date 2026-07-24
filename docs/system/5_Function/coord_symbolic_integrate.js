export const id = "coord_symbolic_integrate";

export function behavior(input, state) {
  const output = { type: "symbolic_integrate", payload: input };
  return { output, state };
}
