export const id = "coord_http_options";

export function behavior(input, state) {
  const output = { type: "http_options", payload: input };
  return { output, state };
}
