export const id = "coord_encode_html_entities";

export function behavior(input, state) {
  const output = { type: "encode_html_entities", payload: input };
  return { output, state };
}
