export const id = "coord_search_web_videos";

export function behavior(input, state) {
  const output = { type: "search_web_videos", payload: input };
  return { output, state };
}
