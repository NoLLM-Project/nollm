export const id = "coord_llm_summarize_text";

export function behavior(input, state) {
  const output = {
    type: "summarize_text",
    payload: input
  };

  return { output, state };
}
