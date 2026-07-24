export const id = "coord_convert_markdown_to_html";

export function behavior(input, state) {
  const output = { type: "convert_markdown_to_html", payload: input };
  return { output, state };
}
