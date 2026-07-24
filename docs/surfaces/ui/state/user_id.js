// surfaces/ui/state/user_id.js
// UI-local opaque user_id — generated on load, resettable, never fused with history.

export const userIdState = {
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
