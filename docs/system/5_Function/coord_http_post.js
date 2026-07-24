export const id = "coord_http_post";

export function behavior(input, state) {
  const output = { type: "http_post", payload: input };
  return { output, state };
}
