export const id = "coord_llm_answer_question";

export function behavior(input, state) {
  const output = {
    type: "answer_question",
    payload: input
  };

  return { output, state };
}
