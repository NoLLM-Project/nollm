// surfaces/ui/ui_live.js
// Surface controller — the ONLY bridge between UI and system.

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
import { initUserId, getUserId } from "./state/user_id.js";
import { initConversationId, getConversationId } from "./state/conversation_id.js";
import { loadHistory, addMessage } from "./state/history.js";

// -----------------------------
// Surfaces components
// -----------------------------
import { ChatWindow } from "./components/chat_window.js";
import { ChatInput } from "./components/chat_input.js";
import { Menu } from "./components/menu.js";

// -----------------------------
// UI Actions
// -----------------------------
import { actionResetUserId } from "./actions/reset_user_id.js";
import { actionNewConversationId } from "./actions/new_conversation.js";
import { actionDeleteHistory as actionClearHistory } from "./actions/delete_history.js";


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
  // InputPanel.init(onUserSubmit);
  WorkflowPanel.init();
  CarrierPanel.init();
  OutputPanel.init();

  // --- Event bus ---
  wireEventBus();

  // --- Merged UI wiring ---
  mergedUIInit();
});


// ------------------------------------------------------------
// USER SUBMISSION HANDLER
// ------------------------------------------------------------
async function onUserSubmit(text) {

  addMessage({ type: "user", text });
  ChatWindow.render();

  uiState.workflowSteps = [];
  uiState.carrier = null;
  WorkflowPanel.render();
  CarrierPanel.render();

  const envelope = {
    message: text,
    tag: {
      user_id: getUserId(),
      conversation_id: getConversationId(),
      timestamp: Date.now()
    }
  };

  try {
    const systemText = await sendToSystem(envelope);

    addMessage({ type: "system", text: systemText });
    ChatWindow.render();

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
// MERGED UI LOGIC
// ------------------------------------------------------------
function mergedUIInit() {

  let conversations = [];
  let activeConversationId = null;

  function updateSettingsUserIdDisplay() {
    const el = document.getElementById("settings-user-id");
    if (el) el.textContent = getUserId();
  }

  function newConversation() {
    const id = "conv-" + Math.random().toString(36).slice(2, 10);

    conversations.push({ id, messages: [] });
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
    if (!list) return;

    list.innerHTML = "";

    conversations.forEach(conv => {
      const item = document.createElement("div");
      item.className = "sidebar-item" + (conv.id === activeConversationId ? " selected" : "");
      item.dataset.label = "Conversation";
      item.innerHTML = `
        <span class="sidebar-icon">💬</span>
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

    if (!conv || !win) {
      if (win) win.innerHTML = "";
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
  // Wire UI buttons
  // -------------------------------
  document.querySelector(".sidebar-new-convo").addEventListener("click", () => {
    actionNewConversationId();
    newConversation();
  });

  document.getElementById("settings-reset-user").addEventListener("click", () => {
    actionResetUserId();
    updateSettingsUserIdDisplay();
  });

  document.getElementById("settings-clear-history").addEventListener("click", () => {
    actionClearHistory();
    clearHistoryUI();
    ChatWindow.render();
  });

  // -------------------------------
  // Sidebar collapse
  // -------------------------------
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  // -------------------------------
  // Settings drawer wiring
  // -------------------------------

  // Settings drawer wiring (after Surfaces UI mounts)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const settingsDrawer = document.getElementById("settings-drawer");
      const settingsOpenBtn = document.getElementById("open-settings");
      const settingsCloseBtn = document.getElementById("settings-close");

      if (settingsOpenBtn && settingsDrawer) {
        settingsOpenBtn.addEventListener("click", () => {
          settingsDrawer.classList.toggle("open");
          updateSettingsUserIdDisplay();
        });
      }

      if (settingsCloseBtn && settingsDrawer) {
        settingsCloseBtn.addEventListener("click", () => {
          settingsDrawer.classList.remove("open");
        });
      }
    });
  });

  // -------------------------------
  // Thinking + Diagnostics toggles
  // -------------------------------
  const thinkingToggle = document.getElementById("toggle-thinking");
  const diagnosticsToggle = document.getElementById("toggle-diagnostics");

  if (thinkingToggle) {
    thinkingToggle.addEventListener("change", (e) => {
      window.dispatchEvent(new CustomEvent("toggleThinking", { detail: e.target.checked }));
    });
  }

  if (diagnosticsToggle) {
    diagnosticsToggle.addEventListener("change", (e) => {
      window.dispatchEvent(new CustomEvent("toggleDiagnostics", { detail: e.target.checked }));
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
