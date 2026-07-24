export const id = "coord_convert_csv_to_json";

export function behavior(input, state) {
  const output = { type: "convert_csv_to_json", payload: input };
  return { output, state };
}
