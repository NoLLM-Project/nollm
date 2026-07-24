export const id = "coord_search_web_text";

export function behavior(input, state) {
  const output = { type: "search_web_text", payload: input };
  return { output, state };
}
