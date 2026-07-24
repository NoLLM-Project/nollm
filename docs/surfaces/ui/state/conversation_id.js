// surfaces/ui/state/conversation_id.js
// UI-local opaque conversation_id — one per thread, resettable, non-semantic.

export const conversationIdState = {
  value: null
};

// Safe UUID generator with fallback
function generateUUID() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  // Fallback: RFC4122-ish UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function initConversationId() {
  if (!conversationIdState.value) {
    conversationIdState.value = generateUUID();
  }
}

export function getConversationId() {
  return conversationIdState.value;
}

export function newConversationId() {
  conversationIdState.value = generateUUID();
}
