export const id = "coord_convert_text_to_titlecase";

export function behavior(input, state) {
  const output = { type: "convert_text_to_titlecase", payload: input };
  return { output, state };
}
