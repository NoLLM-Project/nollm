export const id = "coord_http_head";

export function behavior(input, state) {
  const output = { type: "http_head", payload: input };
  return { output, state };
}
