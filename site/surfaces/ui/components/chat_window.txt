// surfaces/ui/components/chat_window.js
// Render chat bubbles from Surfaces history into #chat-window.

import { getHistory } from "../state/history.js";

export const ChatWindow = {
  init() {
    this.container = document.getElementById("chat-window");
    this.render();
  },

  render() {
    if (!this.container) return;

    const messages = getHistory();

    this.container.innerHTML = messages
      .map(msg => {
        const cls = msg.type === "user" ? "bubble-user" : "bubble-system";
        return `<div class="chat-bubble ${cls}">${escapeHtml(msg.text)}</div>`;
      })
      .join("");

    this.container.scrollTop = this.container.scrollHeight;
  }
};


// Simple HTML escaping to prevent injection
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
