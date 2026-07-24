// server.js
import express from "express";
import { runEnvelope } from "./system_engine.js";

const app = express();
app.use(express.json());

app.post("/run", async (req, res) => {
  const output = await runEnvelope(req.body);
  res.json(output);
});

app.listen(3000, () => {
  console.log("System-plane running at http://localhost:3000");
});
