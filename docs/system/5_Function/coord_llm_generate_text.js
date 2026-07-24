export const id = "coord_llm_generate_text";

export function behavior(input, state) {
  const output = {
    type: "generate_text",
    payload: input
  };

  return { output, state };
}
