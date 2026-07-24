export const id = "coord_symbolic_substitute";

export function behavior(input, state) {
  const output = { type: "symbolic_substitute", payload: input };
  return { output, state };
}
