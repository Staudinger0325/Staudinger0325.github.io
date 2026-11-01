const THEME_KEY = "theme";

const getStoredTheme = () => {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  localStorage.removeItem(THEME_KEY);
  return null;
};

const getActiveTheme = () => {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
};

const setHighlight = (theme) => {
  const lightHighlight = document.getElementById("highlight_theme_light");
  const darkHighlight = document.getElementById("highlight_theme_dark");
  if (!lightHighlight || !darkHighlight) {
    return;
  }

  if (theme === "dark") {
    lightHighlight.media = "none";
    darkHighlight.media = "";
    return;
  }

  darkHighlight.media = "none";
  lightHighlight.media = "";
};

const transTheme = () => {
  document.documentElement.classList.add("transition");
  window.setTimeout(() => {
    document.documentElement.classList.remove("transition");
  }, 500);
};

const setTheme = (theme, options = {}) => {
  const shouldPersist = options.persist !== false;
  const normalizedTheme = theme === "dark" ? "dark" : "light";

  transTheme();
  setHighlight(normalizedTheme);

  if (normalizedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  if (shouldPersist) {
    localStorage.setItem(THEME_KEY, normalizedTheme);
  }

  if (typeof medium_zoom !== "undefined") {
    medium_zoom.update({
      background: `${getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color")}ee`,
    });
  }
};

const toggleTheme = (theme) => {
  setTheme(theme === "dark" ? "light" : "dark");
};

const initTheme = () => {
  setTheme(getStoredTheme() || "dark", { persist: false });
};

initTheme();
