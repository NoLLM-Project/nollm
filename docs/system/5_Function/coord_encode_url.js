export const id = "coord_encode_url";

export function behavior(input, state) {
  const output = { type: "encode_url", payload: input };
  return { output, state };
}
