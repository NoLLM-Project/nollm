export const id = "coord_compute_math";

export function behavior(input, state) {
  const output = { type: "compute_math", payload: input };
  return { output, state };
}
