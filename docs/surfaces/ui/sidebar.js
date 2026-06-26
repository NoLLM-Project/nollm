const sidebar = document.querySelector(".sidebar");
const settingsDrawer = document.getElementById("settings-drawer");

// Collapse sidebar
document.getElementById("sidebar-toggle").addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  settingsDrawer.classList.remove("open");
});

// New conversation button forwards to menu action
document.querySelector(".sidebar-new-convo").addEventListener("click", () => {
  document.getElementById("menu-new-conversation").click();
});
