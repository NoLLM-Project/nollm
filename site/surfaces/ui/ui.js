// surfaces/ui/ui.js
// Surface controller — the ONLY bridge between UI and system/
// Clean, reversible, non-fused. Surfaces → system receiver → workflow.

import { uiState } from "./state/ui_state.js";
import { eventBus } from "./state/event_bus.js";

// -----------------------------
// System UI panels
// -----------------------------
import { InputPanel } from "./components/InputPanel.js";
import { WorkflowPanel } from "./components/WorkflowPanel.js";
import { CarrierPanel } from "./components/CarrierPanel.js";
import { OutputPanel } from "./components/OutputPanel.js";

// -----------------------------
// Surfaces state
// -----------------------------
import { initUserId, getUserId } from "../state/user_id.js";
import { initConversationId, getConversationId } from "../state/conversation_id.js";
import { loadHistory, addMessage } from "../state/history.js";

// -----------------------------
// Surfaces components
// -----------------------------
import { ChatWindow } from "../components/chat_window.js";
import { ChatInput } from "../components/chat_input.js";
import { Menu } from "../components/menu.js";


// ------------------------------------------------------------
// REMOVE THIS (illegal import)
// ------------------------------------------------------------
// import { runner } from "../../system/runner_adapter.js";


// ------------------------------------------------------------
// Minimal async bridge to system
// ------------------------------------------------------------
function sendToSystem(envelope) {
  return new Promise((resolve, reject) => {
    const fn = window.__system_handleEnvelope;
    if (typeof fn !== "function") {
      return reject(new Error("System receiver not registered"));
    }

    try {
      fn(envelope, resolve);
    } catch (err) {
      reject(err);
    }
  });
}


// ------------------------------------------------------------
// Minimal error panel helper
// ------------------------------------------------------------
function showSystemError(text) {
  const el = document.getElementById("system-error-panel");
  if (el) el.textContent = text;
}


// ------------------------------------------------------------
// INITIALIZATION
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

  // --- Surfaces state ---
  initUserId();
  initConversationId();
  loadHistory();

  // --- Surfaces UI ---
  ChatWindow.init();
  ChatInput.init(onUserSubmit);
  Menu.init();

  // --- System UI ---
  InputPanel.init(onUserSubmit);
  WorkflowPanel.init();
  CarrierPanel.init();
  OutputPanel.init();

  wireEventBus();
});


// ------------------------------------------------------------
// USER SUBMISSION HANDLER (async + error separation)
// ------------------------------------------------------------
async function onUserSubmit(text) {

  // 1. Surfaces: add user bubble
  addMessage({ type: "user", text });
  ChatWindow.render();

  // 2. System UI: reset workflow + carrier
  uiState.workflowSteps = [];
  uiState.carrier = null;
  WorkflowPanel.render();
  CarrierPanel.render();

  // 3. Build envelope
  const envelope = {
    message: text,
    tag: {
      user_id: getUserId(),
      conversation_id: getConversationId(),
      timestamp: Date.now()
    }
  };

  try {
    // ⭐ 4. Await system output
    const systemText = await sendToSystem(envelope);

    // 5. Surfaces: add system bubble (success)
    addMessage({ type: "system", text: systemText });
    ChatWindow.render();

    // 6. System UI: update output panel
    uiState.finalOutput = systemText;
    OutputPanel.render();

    // Clear error panel on success
    showSystemError("");

  } catch (err) {

    // ⭐ Error path: DO NOT add a chat bubble
    const errorText = `System Error: ${err.message || err}`;

    // Show error in separate panel
    showSystemError(errorText);

    // Still update finalOutput for debugging
    uiState.finalOutput = errorText;
    OutputPanel.render();
  }
}


// ------------------------------------------------------------
// EVENT BUS WIRING
// ------------------------------------------------------------
function wireEventBus() {

  eventBus.on("workflow_step", (stepName) => {
    uiState.workflowSteps.push(stepName);
    WorkflowPanel.render();
  });

  eventBus.on("carrier_update", (carrier) => {
    uiState.carrier = carrier;
    CarrierPanel.render();
  });

  eventBus.on("final_output", (output) => {
    uiState.finalOutput = output;

    // Surfaces bubble
    addMessage({ type: "system", text: output });
    ChatWindow.render();

    OutputPanel.render();
  });
}
