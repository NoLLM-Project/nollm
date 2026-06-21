// surfaces/ui/state/user_id.js
// UI-local opaque user_id — generated on load, resettable, never fused with history.

export const userIdState = {
  value: null
};

// Simple UUIDv4 generator (UI-local, non-semantic)
function generateUUID() {
  return crypto.randomUUID();
}

export function initUserId() {
  if (!userIdState.value) {
    userIdState.value = generateUUID();
  }
}

export function getUserId() {
  return userIdState.value;
}

export function resetUserId() {
  userIdState.value = generateUUID();
}
