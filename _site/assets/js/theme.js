const THEME_KEY = "theme";
const DAY_START_HOUR = 10;
const DAY_END_HOUR = 17;

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

const getPrefersColorSchemeTheme = () => {
  const media = window.matchMedia;
  if (media && media("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

const fetchJsonWithTimeout = async (url, timeoutMs = 3000) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const getTimezoneHour = (timeZone) => {
  if (!timeZone) {
    return null;
  }
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone,
      }).format(new Date())
    );
    return Number.isInteger(hour) ? hour : null;
  } catch (error) {
    return null;
  }
};

const getIpTimeTheme = async () => {
  const providers = [
    async () => {
      const data = await fetchJsonWithTimeout("https://ipapi.co/json/");
      return data && data.timezone ? data.timezone : null;
    },
    async () => {
      const data = await fetchJsonWithTimeout("https://ipwho.is/");
      if (!data || data.success === false || !data.timezone) {
        return null;
      }
      return data.timezone.id || null;
    },
  ];

  for (const provider of providers) {
    const timeZone = await provider();
    const hour = getTimezoneHour(timeZone);
    if (hour === null) {
      continue;
    }
    return hour >= DAY_START_HOUR && hour <= DAY_END_HOUR ? "light" : "dark";
  }

  return null;
};

const initTheme = async () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    setTheme(storedTheme, { persist: false });
    return;
  }

  setTheme(getPrefersColorSchemeTheme(), { persist: false });

  const ipTimeTheme = await getIpTimeTheme();
  if (!ipTimeTheme) {
    return;
  }

  if (!getStoredTheme()) {
    setTheme(ipTimeTheme, { persist: false });
  }
};

initTheme();
