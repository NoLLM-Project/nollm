async function loadComponent(id, file) {
  const container = document.getElementById(id);
  const html = await fetch(`/surfaces/ui/components/${file}`).then(r => r.text());
  container.innerHTML = html;
}

loadComponent("menu-container", "menu.html");
loadComponent("sidebar-container", "sidebar.html");
loadComponent("chat-container", "chat.html");
loadComponent("system-panels-container", "system-panels.html");
loadComponent("drawer-container", "drawer.html");
