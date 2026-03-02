document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("light-toggle");
  if (!toggleButton) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const currentTheme = typeof getActiveTheme === "function" ? getActiveTheme() : "light";
    toggleTheme(currentTheme);
  });
});
