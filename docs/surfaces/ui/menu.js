// Reset user
document.getElementById("menu-reset-user").addEventListener("click", () => {
  localStorage.removeItem("userId");
  alert("User ID reset.");
});

// New conversation
document.getElementById("menu-new-conversation").addEventListener("click", () => {
  document.getElementById("chat-window").innerHTML = "";
});

// Clear history
document.getElementById("menu-clear-history").addEventListener("click", () => {
  document.getElementById("chat-window").innerHTML = "";
  alert("History cleared.");
});
