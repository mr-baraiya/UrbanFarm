import React from "react";
import { useTheme } from "../../hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle colour theme"
    >
      {theme === "light" ? "Dark mode" : "Light mode"}
    </button>
  );
};

export default ThemeToggle;
