import React from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useTheme } from "hooks/useTheme";
import { useToggleTheme } from "hooks/useToggleThemeContext";

import { darkTheme, lightTheme } from "styles/themes";

import ThemeProvider from "./ThemeProvider";

const ThemeConsumer = () => {
  const [mode, toggleTheme] = useToggleTheme();
  const colors = useTheme();
  return (
    <button onClick={toggleTheme} data-color={colors.primaryText}>
      {mode}
    </button>
  );
};

const renderTheme = () =>
  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );

afterEach(() => {
  cleanup();
  document.documentElement.className = "";
});

describe("ThemeProvider", () => {
  it("defaults CSS and canvas colors to dark without removing other root classes", () => {
    document.documentElement.className = "existing-root-class";
    renderTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("existing-root-class")).toBe(true);
    expect(screen.getByRole("button", { name: "dark" }).getAttribute("data-color")).toBe(darkTheme.primaryText);
  });

  it("restores the saved light theme and synchronizes CSS, resolved colors, and storage on toggle", () => {
    localStorage.setItem("theme", JSON.stringify("light"));
    document.documentElement.classList.add("dark");
    renderTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    const button = screen.getByRole("button", { name: "light" });
    expect(button.getAttribute("data-color")).toBe(lightTheme.primaryText);
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(button.getAttribute("data-color")).toBe(darkTheme.primaryText);
    expect(localStorage.getItem("theme")).toBe(JSON.stringify("dark"));
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(button.getAttribute("data-color")).toBe(lightTheme.primaryText);
    expect(localStorage.getItem("theme")).toBe(JSON.stringify("light"));
  });

  it("recovers from malformed stored preferences", () => {
    localStorage.setItem("theme", "not valid JSON");
    renderTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button", { name: "dark" }).getAttribute("data-color")).toBe(darkTheme.primaryText);
  });
});
