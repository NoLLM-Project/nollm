export const id = "coord_convert_json_to_yaml";

export function behavior(input, state) {
  const output = { type: "convert_json_to_yaml", payload: input };
  return { output, state };
}
