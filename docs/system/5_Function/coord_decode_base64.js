export const id = "coord_decode_base64";

export function behavior(input, state) {
  const output = { type: "decode_base64", payload: input };
  return { output, state };
}
