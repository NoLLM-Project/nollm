export const id = "coord_http_patch";

export function behavior(input, state) {
  const output = { type: "http_patch", payload: input };
  return { output, state };
}
