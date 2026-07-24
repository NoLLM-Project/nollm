export const id = "coord_llm_rewrite_text";

export function behavior(input, state) {
  const output = {
    type: "rewrite_text",
    payload: input
  };

  return { output, state };
}
