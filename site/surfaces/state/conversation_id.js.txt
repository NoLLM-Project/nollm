// surfaces/ui/state/conversation_id.js
// UI-local opaque conversation_id — one per thread, resettable, non-semantic.

export const conversationIdState = {
  value: null
};

// Simple UUIDv4 generator (UI-local, non-semantic)
function generateUUID() {
  return crypto.randomUUID();
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
