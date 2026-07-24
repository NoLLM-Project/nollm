export const id = "coord_search_web_news";

export function behavior(input, state) {
  const output = { type: "search_web_news", payload: input };
  return { output, state };
}
