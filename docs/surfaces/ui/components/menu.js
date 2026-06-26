// surfaces/ui/components/menu.js
// Menu actions: reset user_id, new conversation, clear history.

import { resetUserId } from "../state/user_id.js";
import { newConversationId } from "../state/conversation_id.js";
import { clearHistory } from "../state/history.js";
import { ChatWindow } from "./chat_window.js";

export const Menu = {
  init() {
    this.resetUserBtn = document.getElementById("menu-reset-user");
    this.newConvBtn = document.getElementById("menu-new-conversation");
    this.clearHistoryBtn = document.getElementById("menu-clear-history");

    if (this.resetUserBtn) {
      this.resetUserBtn.addEventListener("click", () => {
        resetUserId();
      });
    }

    if (this.newConvBtn) {
      this.newConvBtn.addEventListener("click", () => {
        newConversationId();
        clearHistory();
        ChatWindow.render();
      });
    }

    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener("click", () => {
        clearHistory();
        ChatWindow.render();
      });
    }
  }
};
