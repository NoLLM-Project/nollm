const settingsDrawer = document.getElementById("settings-drawer");
const settingsButton = document.querySelector(".sidebar-setting-item[data-label='Settings']");
const settingsClose = document.getElementById("settings-close");

// Toggle drawer
settingsButton.addEventListener("click", () => {
  settingsDrawer.classList.toggle("open");

  if (settingsDrawer.classList.contains("open")) {
    const id = localStorage.getItem("userId") || "(none)";
    document.getElementById("settings-user-id").textContent = id;
  }
});

// Close drawer via X
settingsClose.addEventListener("click", () => {
  settingsDrawer.classList.remove("open");
});

// Reset user
document.getElementById("settings-reset-user").addEventListener("click", () => {
  document.getElementById("menu-reset-user").click();
});

// Clear history
document.getElementById("settings-clear-history").addEventListener("click", () => {
  document.getElementById("menu-clear-history").click();
});

// Thinking toggle
document.getElementById("toggle-thinking").addEventListener("change", (e) => {
  window.dispatchEvent(new CustomEvent("toggleThinking", { detail: e.target.checked }));
});

// Diagnostics toggle
document.getElementById("toggle-diagnostics").addEventListener("change", (e) => {
  window.dispatchEvent(new CustomEvent("toggleDiagnostics", { detail: e.target.checked }));
});
