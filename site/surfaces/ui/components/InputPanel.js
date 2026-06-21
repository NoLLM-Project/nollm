// ui/components/InputPanel.js
// Pure UI component — captures user text and passes it to ui.js.
// No system-plane logic. No coords. No architecture. Just DOM + callback.

export const InputPanel = {
  root: null,
  inputEl: null,
  buttonEl: null,
  onSubmit: null,

  init(onSubmitCallback) {
    this.onSubmit = onSubmitCallback;

    // Create container
    this.root = document.getElementById("input-panel");
    if (!this.root) {
      console.error("InputPanel: #input-panel not found in DOM");
      return;
    }

    // Create input box
    this.inputEl = document.createElement("textarea");
    this.inputEl.id = "input-text";
    this.inputEl.placeholder = "Type your message…";
    this.inputEl.rows = 3;

    // Create submit button
    this.buttonEl = document.createElement("button");
    this.buttonEl.id = "input-submit";
    this.buttonEl.textContent = "Send";

    // Wire events
    this.buttonEl.addEventListener("click", () => this.submit());
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.submit();
      }
    });

    // Add to DOM
    this.root.appendChild(this.inputEl);
    this.root.appendChild(this.buttonEl);
  },

  submit() {
    const text = this.inputEl.value.trim();
    if (!text) return;

    // Pass text to ui.js
    this.onSubmit(text);

    // Clear input
    this.inputEl.value = "";
  }
};
