export const id = "coord_search_web_images";

export function behavior(input, state) {
  const output = { type: "search_web_images", payload: input };
  return { output, state };
}
