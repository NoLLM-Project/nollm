export const id = "coord_decode_html_entities";

export function behavior(input, state) {
  const output = { type: "decode_html_entities", payload: input };
  return { output, state };
}
