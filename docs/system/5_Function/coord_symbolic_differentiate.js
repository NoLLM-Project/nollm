export const id = "coord_symbolic_differentiate";

export function behavior(input, state) {
  const output = { type: "symbolic_differentiate", payload: input };
  return { output, state };
}
