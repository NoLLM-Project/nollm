export const id = "coord_http_get";

export function behavior(input, state) {
  const output = { type: "http_get", payload: input };
  return { output, state };
}
