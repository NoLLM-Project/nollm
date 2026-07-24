export const id = "coord_symbolic_normalize";

export function behavior(input, state) {
  const output = { type: "symbolic_normalize", payload: input };
  return { output, state };
}
