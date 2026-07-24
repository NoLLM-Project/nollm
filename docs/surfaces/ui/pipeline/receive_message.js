// surfaces/ui/pipeline/receive_message.js
// Accept system output → store in Surfaces history → update chat UI.

import { addMessage } from "../state/history.js";
import { ChatWindow } from "../components/chat_window.js";

export function receiveMessage(systemText) {

  // Ensure systemText is always a string
  const safeText =
    typeof systemText === "string"
      ? systemText
      : JSON.stringify(systemText, null, 2);

  // 1. Store system bubble in Surfaces history
  addMessage({
    type: "system",
    text: safeText
  });

  // 2. Re-render chat window
  ChatWindow.render();
}

