export const id = "coord_http_put";

export function behavior(input, state) {
  const output = { type: "http_put", payload: input };
  return { output, state };
}
