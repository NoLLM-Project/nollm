export const id = "coord_convert_text_to_uppercase";

export function behavior(input, state) {
  const output = { type: "convert_text_to_uppercase", payload: input };
  return { output, state };
}
