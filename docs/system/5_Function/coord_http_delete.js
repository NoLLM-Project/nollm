export const id = "coord_http_delete";

export function behavior(input, state) {
  const output = { type: "http_delete", payload: input };
  return { output, state };
}
