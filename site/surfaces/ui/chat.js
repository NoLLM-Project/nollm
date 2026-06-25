const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

// Send message
chatSend.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;

  addUserBubble(text);
  chatInput.value = "";
});

// Add user bubble
function addUserBubble(text) {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble bubble-user";
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
