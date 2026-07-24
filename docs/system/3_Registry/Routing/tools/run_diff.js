import { diffAgainstFile } from "./routing_diff.js";

const result = diffAgainstFile("old_routing.json");

console.log("=== Routing Diff Report ===");
console.log("Added:", result.added.length);
console.log("Removed:", result.removed.length);
console.log("Modified:", result.modified.length);
console.log("Unchanged:", result.unchanged.length);

console.log("\nDetailed diff:");
console.log(JSON.stringify(result, null, 2));
