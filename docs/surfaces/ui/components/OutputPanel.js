// ui/components/OutputPanel.js
import { uiState } from "../state/ui_state.js";

export const OutputPanel = {
  root: null,

  init() {
    this.root = document.getElementById("output-panel");
    if (!this.root) {
      console.error("OutputPanel: #output-panel not found in DOM");
      return;
    }

    this.render();
  },

  render() {
    if (!this.root) return;

    this.root.innerHTML = "";

    uiState.bubbles.forEach((bubble) => {
      const div = document.createElement("div");
      div.textContent = bubble.text;

      div.style.padding = "8px 10px";
      div.style.borderRadius = "8px";
      div.style.maxWidth = "70%";
      div.style.fontSize = "14px";
      div.style.lineHeight = "1.4";

      if (bubble.type === "user") {
        div.style.alignSelf = "flex-end";
        div.style.background = "#2563eb";
        div.style.color = "white";
      } else {
        div.style.alignSelf = "flex-start";
        div.style.background = "#1f2937";
        div.style.color = "white";
      }

      this.root.appendChild(div);
    });

    this.root.scrollTop = this.root.scrollHeight;
  }
};
