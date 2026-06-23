// system/run_engine.js
import { runEngine } from "./1_Engine/engine.js";
import { PATH_FORWARD, PATH_REVERSE } from "./1_Engine/paths.js";

// Example payload
const payload = {
    rawFile: "example.txt",
    userToken: "abc123"
};

// Move forward through the hotel structure
runEngine(PATH_FORWARD, payload);

// Move back to the tower
runEngine(PATH_REVERSE, null);
