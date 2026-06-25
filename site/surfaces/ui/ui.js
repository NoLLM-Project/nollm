// surfaces/ui/ui.js
// Surface controller — the ONLY bridge between UI and system.
// Clean, reversible, non-fused. Surfaces → system receiver → workflow.

import { uiState } from "./ui/state/ui_state.js";
import { eventBus } from "./ui/state/event_bus.js";

// -----------------------------
// System UI panels
// -----------------------------
import { InputPanel } from "./ui/components/InputPanel.js";
import { WorkflowPanel } from "./ui/components/WorkflowPanel.js";
import { CarrierPanel } from "./ui/components/CarrierPanel.js";
import { OutputPanel } from "./ui/components/OutputPanel.js";

// -----------------------------
// Surfaces state
// -----------------------------
import { initUserId, getUserId } from "./ui/state/user_id.js";
import { initConversationId, getConversationId } from "./ui/state/conversation_id.js";
import { loadHistory, addMessage } from "./ui/state/history.js";

// -----------------------------
// Surfaces components
// -----------------------------
import { ChatWindow } from "./ui/components/chat_window.js";
import { ChatInput } from "./ui/components/chat_input.js";
import { Menu } from "./ui/components/menu.js";

// -----------------------------
// UI Actions (your files)
// -----------------------------
import { actionResetUserId } from "./ui/actions/reset_user_id.js";
import { newConversationId as actionNewConversationId } from "./ui/actions/new_conversation.js";
import { clearHistory as actionClearHistory } from "./ui/actions/delete_history.js";


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
// DOMContentLoaded — Surfaces init + merged UI wiring
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

  // --- Event bus ---
  wireEventBus();

  // --- Merged UI wiring ---
  mergedUIInit();
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
    // 4. Await system output
    const systemText = await sendToSystem(envelope);

    // 5. Surfaces: add system bubble
    addMessage({ type: "system", text: systemText });
    ChatWindow.render();

    // 6. System UI: update output panel
    uiState.finalOutput = systemText;
    OutputPanel.render();

    showSystemError("");

  } catch (err) {

    const errorText = `System Error: ${err.message || err}`;

    showSystemError(errorText);

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

    addMessage({ type: "system", text: output });
    ChatWindow.render();

    OutputPanel.render();
  });
}


// ------------------------------------------------------------
// MERGED UI LOGIC (formerly app.js)
// ------------------------------------------------------------
function mergedUIInit() {

  // -------------------------------
  // Local UI state
  // -------------------------------
  let conversations = [];
  let activeConversationId = null;

  // -------------------------------
  // Helpers
  // -------------------------------
  function updateSettingsUserIdDisplay() {
    const el = document.getElementById("settings-user-id");
    if (el) el.textContent = getUserId();
  }

  function newConversation() {
    const id = "conv-" + Math.random().toString(36).slice(2, 10);

    conversations.push({
      id,
      messages: []
    });

    activeConversationId = id;
    renderConversationList();
    renderMessages();
  }

  function clearHistoryUI() {
    const conv = conversations.find(c => c.id === activeConversationId);
    if (conv) {
      conv.messages = [];
      renderMessages();
    }
  }

  function renderConversationList() {
    const list = document.getElementById("conversation-list");
    list.innerHTML = "";

    conversations.forEach(conv => {
      const item = document.createElement("div");
      item.className = "sidebar-item" + (conv.id === activeConversationId ? " selected" : "");
      item.dataset.label = "Conversation";
      item.innerHTML = `
        <span class="icon">💬</span>
        <span>${conv.id}</span>
      `;

      item.addEventListener("click", () => {
        activeConversationId = conv.id;
        renderConversationList();
        renderMessages();
      });

      list.appendChild(item);
    });
  }

  function renderMessages() {
    const conv = conversations.find(c => c.id === activeConversationId);
    const win = document.getElementById("chat-window");

    if (!conv) {
      win.innerHTML = "";
      return;
    }

    win.innerHTML = conv.messages
      .map(msg => `
        <div class="chat-bubble ${msg.role === "user" ? "bubble-user" : "bubble-system"}">
          ${msg.text}
          <div class="timestamp">${msg.timestamp}</div>
        </div>
      `)
      .join("");

    win.scrollTop = win.scrollHeight;
  }

  function sendLocalUserMessage(text) {
    const conv = conversations.find(c => c.id === activeConversationId);
    if (!conv) return;

    conv.messages.push({
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString()
    });

    renderMessages();
  }

  // -------------------------------
  // Wire UI buttons (with actions)
  // -------------------------------
  document.querySelector(".sidebar-new-convo").addEventListener("click", () => {
    actionNewConversationId(); // system-level
    newConversation();         // UI-level
  });

  document.getElementById("settings-reset-user").addEventListener("click", () => {
    actionResetUserId();          // system-level
    updateSettingsUserIdDisplay(); // UI-level
  });

  document.getElementById("settings-clear-history").addEventListener("click", () => {
    actionClearHistory(); // system-level
    clearHistoryUI();     // UI-level
    ChatWindow.render();
  });

  document.getElementById("sidebar-toggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
  });

  // -------------------------------
  // Settings drawer wiring
  // -------------------------------
  const settingsDrawer = document.getElementById("settings-drawer");
  const settingsOpenBtn = document.getElementById("open-settings");
  const settingsCloseBtn = document.getElementById("settings-close");

  if (settingsOpenBtn && settingsDrawer) {
    settingsOpenBtn.addEventListener("click", () => {
      settingsDrawer.classList.add("open");
      updateSettingsUserIdDisplay();
    });
  }

  if (settingsCloseBtn && settingsDrawer) {
    settingsCloseBtn.addEventListener("click", () => {
      settingsDrawer.classList.remove("open");
    });
  }

  // -------------------------------
  // Chat input wiring
  // -------------------------------
  document.getElementById("chat-send").addEventListener("click", () => {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendLocalUserMessage(text);
    onUserSubmit(text);
  });

  document.getElementById("chat-input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const text = e.target.value.trim();
      if (!text) return;
      e.target.value = "";
      sendLocalUserMessage(text);
      onUserSubmit(text);
    }
  });

  // -------------------------------
  // Initialize UI
  // -------------------------------
  updateSettingsUserIdDisplay();
  newConversation();
}
