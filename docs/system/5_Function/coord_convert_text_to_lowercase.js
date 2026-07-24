export const id = "coord_convert_text_to_lowercase";

export function behavior(input, state) {
  const output = { type: "convert_text_to_lowercase", payload: input };
  return { output, state };
}
