// 3_Registry/_infrastructure/file_utils.js

import fs from "fs";
import path from "path";

export function readJsonFilesRecursively(basePath) {
  const results = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        const raw = fs.readFileSync(fullPath, "utf8");
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
          throw new Error(`Routing file must export an array: ${fullPath}`);
        }

        results.push(parsed);
      }
    }
  }

  walk(basePath);
  return results;
}
