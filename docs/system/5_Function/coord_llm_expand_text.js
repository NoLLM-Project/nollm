export const id = "coord_llm_expand_text";

export function behavior(input, state) {
  const output = {
    type: "expand_text",
    payload: input
  };

  return { output, state };
}
