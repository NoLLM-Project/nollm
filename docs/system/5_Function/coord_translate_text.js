export const id = "coord_translate_text";

export function behavior(input, state) {
  const output = { type: "translate_text", payload: input };
  return { output, state };
}
