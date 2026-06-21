// ui/state/ui_state.js
// Centralized UI state container.
// Pure Surface Plane — no system-plane logic, no coords, no architecture.
// The system-plane updates this state ONLY through event_bus events.

export const uiState = {
  workflowSteps: [],   // array of strings (tower → field → front_desk → runtime → etc.)
  carrier: null,       // current carrier object
  finalOutput: null,   // final output returned by coord_tower (SECOND VISIT)

  // NEW: chat bubbles (append-only)
  bubbles: [],         // { type: "user" | "system", text: string }

  reset() {
    this.workflowSteps = [];
    this.carrier = null;
    this.finalOutput = null;

    // NEW: clear chat bubbles
    this.bubbles = [];
  }
};
