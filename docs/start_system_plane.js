// start_system_plane.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { runEnvelope } from "./system_engine.js";

const app = express();
app.use(express.json());

// ------------------------------------------------------------
// DEBUG: Count how many times the UI calls /run
// ------------------------------------------------------------
let RUN_COUNT = 0;

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------
// STATIC FILES (SERVE YOUR UI)
// ------------------------------------------------------------
app.use(express.static(__dirname));  // Serves F:/nollm/*

// ------------------------------------------------------------
// SERVE index.html AT ROOT
// ------------------------------------------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ------------------------------------------------------------
// SYSTEM-PLANE API
// ------------------------------------------------------------
app.post("/run", async (req, res) => {

  // ⭐ Debug: count and trace every engine run
  RUN_COUNT++;
  console.log(">>> ENGINE RUN #", RUN_COUNT);
  console.log("UI POST BODY", req.body);
  console.log("STACK TRACE FOR /run CALL:");
  console.log(new Error("TRACE").stack);

  // ⭐ Shape the payload exactly how tower expects it
  const initialPayload = {
    rawText: req.body.text,
    text: req.body.text,
    tag: req.body.tag
  };

  const output = await runEnvelope(initialPayload);
  res.json(output);
});

// ------------------------------------------------------------
// START SERVER
// ------------------------------------------------------------
app.listen(3000, () => {
  console.log("System-plane running at http://localhost:3000");
});
