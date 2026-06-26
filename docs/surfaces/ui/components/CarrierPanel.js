// ui/components/CarrierPanel.js
// Pure UI component — displays the carrier JSON as it evolves.
// No system-plane logic. No coords. No architecture. Just DOM rendering.

import { uiState } from "../state/ui_state.js";

export const CarrierPanel = {
  root: null,

  init() {
    this.root = document.getElementById("carrier-panel");
    if (!this.root) {
      console.error("CarrierPanel: #carrier-panel not found in DOM");
      return;
    }

    this.render();
  },

  render() {
    if (!this.root) return;

    // Clear existing content
    this.root.innerHTML = "";

    // Title
    const title = document.createElement("div");
    title.className = "carrier-title";
    title.textContent = "Carrier State";
    this.root.appendChild(title);

    // Pretty-print JSON
    const pre = document.createElement("pre");
    pre.className = "carrier-json";

    if (uiState.carrier) {
      pre.textContent = JSON.stringify(uiState.carrier, null, 2);
    } else {
      pre.textContent = "{}";
    }

    this.root.appendChild(pre);
  }
};
