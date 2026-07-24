export const id = "coord_convert_yaml_to_json";

export function behavior(input, state) {
  const output = { type: "convert_yaml_to_json", payload: input };
  return { output, state };
}
