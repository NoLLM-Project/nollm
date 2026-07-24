export const id = "coord_search_web_definitions";

export function behavior(input, state) {
  const output = { type: "search_web_definitions", payload: input };
  return { output, state };
}
