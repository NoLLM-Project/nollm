export const id = "coord_convert_html_to_text";

export function behavior(input, state) {
  const output = { type: "convert_html_to_text", payload: input };
  return { output, state };
}
