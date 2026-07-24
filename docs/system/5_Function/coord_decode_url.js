export const id = "coord_decode_url";

export function behavior(input, state) {
  const output = { type: "decode_url", payload: input };
  return { output, state };
}
