export const id = "coord_encode_base64";

export function behavior(input, state) {
  const output = { type: "encode_base64", payload: input };
  return { output, state };
}
