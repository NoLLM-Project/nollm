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
import "../adapter/surfaces_adapter.js";

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

// -----------------------------
// Chat pipeline
// -----------------------------
import { sendMessage } from "./pipeline/send_message.js";

// ------------------------------------------------------------
// SYSTEM-PLANE HANDLER (Node bridge)
// ------------------------------------------------------------
window.__system_handleEnvelope = async (envelope, resolve) => {
  try {
    const response = await fetch("http://localhost:3000/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope)
    });

    const { ok, result, error } = await response.json();

    if (ok) {
      eventBus.emit("final_output", result);
      resolve(result);
    } else {
      eventBus.emit("final_output", error);
      resolve(error);
    }
  } catch (err) {
    const msg = err.message || String(err);
    eventBus.emit("final_output", msg);
    resolve(msg);
  }
};


// ------------------------------------------------------------
// Minimal error panel helper
// ------------------------------------------------------------
function showSystemError(text) {
  console.error("RAW SYSTEM ERROR:", text);
  const el = document.getElementById("system-error-panel");
  if (el) el.textContent = text;
}

// ------------------------------------------------------------
// DOMContentLoaded — Surfaces init + merged UI wiring
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

  initUserId();
  initConversationId();
  loadHistory();

  ChatWindow.init();
  ChatInput.init(onUserSubmit);
  Menu.init();

  WorkflowPanel.init();
  CarrierPanel.init();
  OutputPanel.init();

  wireEventBus();
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

  sendMessage(text);
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

    // ⭐ PATCHED: pretty-print workflowContext so the UI actually shows it
    addMessage({ type: "system", text: JSON.stringify(output, null, 2) });

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

  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

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

  // ⭐ INSERTED: Toggle listeners for Thinking + Diagnostics
  window.addEventListener("toggleThinking", (e) => {
    const show = e.detail;

    const workflow = document.getElementById("workflow-panel");
    const carrier = document.getElementById("carrier-panel");

    if (workflow) workflow.style.display = show ? "block" : "none";
    if (carrier) carrier.style.display = show ? "block" : "none";
  });

  window.addEventListener("toggleDiagnostics", (e) => {
    const show = e.detail;

    const output = document.getElementById("output-panel");

    if (output) output.style.display = show ? "block" : "none";
  });

  document.getElementById("chat-send").addEventListener("click", () => {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendLocalUserMessage(text);
    sendMessage(text);
  });

  document.getElementById("chat-input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const text = e.target.value.trim();
      if (!text) return;
      e.target.value = "";
      sendLocalUserMessage(text);
      sendMessage(text);
    }
  });

  updateSettingsUserIdDisplay();
  newConversation();
}
