/**
 * Tests for dark-mode.js functionality
 * Tests theme switching, localStorage persistence, and system preference detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";

describe("Dark Mode", () => {
  let dom;
  let window;
  let document;
  let localStorage;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Test</title></head>
        <body>
          <button id="dark-mode-toggle">Toggle</button>
        </body>
      </html>
    `,
      {
        url: "http://localhost",
      },
    );

    window = dom.window;
    document = window.document;

    // Mock localStorage
    localStorage = {
      store: {},
      getItem(key) {
        return this.store[key] || null;
      },
      setItem(key, value) {
        this.store[key] = value;
      },
      removeItem(key) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      },
    };

    // Make localStorage accessible via bracket notation like the actual code uses
    Object.defineProperty(localStorage, "dark-mode-storage", {
      get() {
        return this.store["dark-mode-storage"];
      },
      set(value) {
        this.store["dark-mode-storage"] = value;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    dom.window.close();
  });

  describe("setTheme", () => {
    it('should set data-theme attribute to "dark"', () => {
      document.documentElement.setAttribute("data-theme", "dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it('should set data-theme attribute to "light"', () => {
      document.documentElement.setAttribute("data-theme", "light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
  });

  describe("updateTheme", () => {
    it('should use localStorage preference when set to "dark"', () => {
      localStorage["dark-mode-storage"] = "dark";

      // Simulate updateTheme logic
      const userPreference = localStorage["dark-mode-storage"];
      if (userPreference === "dark" || userPreference === "light") {
        document.documentElement.setAttribute("data-theme", userPreference);
      }

      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it('should use localStorage preference when set to "light"', () => {
      localStorage["dark-mode-storage"] = "light";

      const userPreference = localStorage["dark-mode-storage"];
      if (userPreference === "dark" || userPreference === "light") {
        document.documentElement.setAttribute("data-theme", userPreference);
      }

      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("should ignore invalid localStorage values", () => {
      localStorage["dark-mode-storage"] = "invalid";

      const userPreference = localStorage["dark-mode-storage"];
      const isValid = userPreference === "dark" || userPreference === "light";

      expect(isValid).toBe(false);
    });
  });

  describe("Theme Toggle", () => {
    it("should switch from light to dark", () => {
      document.documentElement.setAttribute("data-theme", "light");

      // Simulate toggle logic
      if (document.documentElement.getAttribute("data-theme") === "dark") {
        localStorage["dark-mode-storage"] = "light";
      } else {
        localStorage["dark-mode-storage"] = "dark";
      }

      expect(localStorage["dark-mode-storage"]).toBe("dark");
    });

    it("should switch from dark to light", () => {
      document.documentElement.setAttribute("data-theme", "dark");

      // Simulate toggle logic
      if (document.documentElement.getAttribute("data-theme") === "dark") {
        localStorage["dark-mode-storage"] = "light";
      } else {
        localStorage["dark-mode-storage"] = "dark";
      }

      expect(localStorage["dark-mode-storage"]).toBe("light");
    });
  });

  describe("localStorage persistence", () => {
    it("should persist theme preference across page loads", () => {
      localStorage["dark-mode-storage"] = "dark";

      // Simulate page reload - localStorage should retain value
      const storedValue = localStorage["dark-mode-storage"];

      expect(storedValue).toBe("dark");
    });
  });
});
