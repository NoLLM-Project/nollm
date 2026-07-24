// system/utils/load_json.js

import { readFile } from "fs/promises";
import { dirname, resolve, isAbsolute } from "path";
import { fileURLToPath } from "url";

export async function loadJson(pathInput) {
  const here = dirname(fileURLToPath(import.meta.url));

  // If the caller passed an absolute path, use it directly.
  const absolutePath = isAbsolute(pathInput)
    ? pathInput
    : resolve(here, pathInput);

  const data = await readFile(absolutePath, "utf8");
  return JSON.parse(data);
}
