// surfaces/ui/state/history.js
// UI-local chat history — stores user/system messages for the chat window.

export const historyState = {
  messages: []
};

// Load history (UI-local only; no persistence unless you add it)
export function loadHistory() {
  historyState.messages = [];
}

export function addMessage(message) {
  historyState.messages.push(message);
}

export function clearHistory() {
  historyState.messages = [];
}

export function getHistory() {
  return historyState.messages;
}
