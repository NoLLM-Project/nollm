// site/utils/load_json.js

export async function loadJson(path) {
    // Browser or Node 18+ (fetch available)
    if (typeof fetch === "function") {
        const res = await fetch(path);
        if (!res.ok) {
            throw new Error(`Failed to load JSON at ${path}: ${res.status}`);
        }
        return res.json();
    }

    // Node-like fallback
    const { readFile } = await import("fs/promises");
    const { fileURLToPath } = await import("url");
    const { dirname, resolve } = await import("path");

    const here = dirname(fileURLToPath(import.meta.url));
    const absolutePath = resolve(here, path);

    const raw = await readFile(absolutePath, "utf8");
    return JSON.parse(raw);
}
