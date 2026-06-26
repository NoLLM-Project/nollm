// surfaces/ui/components/chat_input.js
// Capture user text → call onSubmit(text)

export const ChatInput = {
  init(onSubmit) {
    this.input = document.getElementById("chat-input");
    this.button = document.getElementById("chat-send");

    if (!this.input || !this.button) return;

    // Send on button click
    this.button.addEventListener("click", () => {
      this.submit(onSubmit);
    });

    // Send on Enter key
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.submit(onSubmit);
      }
    });
  },

  submit(onSubmit) {
    const text = this.input.value.trim();
    if (!text) return;

    onSubmit(text);
    this.input.value = "";
  }
};
