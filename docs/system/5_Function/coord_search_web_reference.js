export const id = "coord_search_web_reference";

export function behavior(input, state) {
  const output = { type: "search_web_reference", payload: input };
  return { output, state };
}
