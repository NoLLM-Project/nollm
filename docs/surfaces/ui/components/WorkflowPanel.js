// ui/components/WorkflowPanel.js
// Pure UI component — displays the list of workflow steps as they fire.
// It listens only to ui_state and renders DOM. No system-plane logic.

import { uiState } from "../state/ui_state.js";

export const WorkflowPanel = {
  root: null,

  init() {
    this.root = document.getElementById("workflow-panel");
    if (!this.root) {
      console.error("WorkflowPanel: #workflow-panel not found in DOM");
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
    title.className = "workflow-title";
    title.textContent = "Workflow Steps";
    this.root.appendChild(title);

    // List container
    const list = document.createElement("ul");
    list.className = "workflow-list";

    // Render each step
    uiState.workflowSteps.forEach((step) => {
      const li = document.createElement("li");
      li.className = "workflow-step";
      li.textContent = step;
      list.appendChild(li);
    });

    this.root.appendChild(list);
  }
};
