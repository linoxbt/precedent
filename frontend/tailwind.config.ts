import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fluent/Explorer-style chrome grays
        chrome: {
          DEFAULT: "#f3f3f3",
          titlebar: "#e8e8e8",
          toolbar: "#f7f7f7",
          pane: "#f9f9f9",
          border: "#d9d9d9",
          hover: "#e9f2fc",
          selected: "#cde8ff",
          statusbar: "#eef4fb",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          muted: "#5a5a5a",
          faint: "#8a8a8a",
        },
        accent: {
          DEFAULT: "#0f6cbd",
          50: "#e8f2fb",
          100: "#cfe6f8",
          400: "#2f8fd6",
          500: "#0f6cbd",
          600: "#0c5aa0",
          700: "#0a4a84",
        },
        folder: {
          DEFAULT: "#ffca6b",
          shadow: "#e0a63e",
        },
        status: {
          ruled: "#0f6cbd",
          final: "#5a5a5a",
          appealed: "#c9822a",
          overturned: "#1e8e5a",
        },
      },
      fontFamily: {
        sans: [
          "'Segoe UI'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Inter'",
          "Roboto",
          "sans-serif",
        ],
        mono: ["'Cascadia Code'", "'Consolas'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        window: "0 1px 2px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.14)",
        panel: "0 1px 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.08)",
        "panel-hover": "0 1px 2px rgba(0,0,0,0.06), 0 3px 8px rgba(0,0,0,0.12)",
        dialog: "0 2px 4px rgba(0,0,0,0.1), 0 16px 40px rgba(0,0,0,0.22)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "highlight-flash": {
          "0%": { backgroundColor: "rgba(15, 108, 189, 0.28)" },
          "100%": { backgroundColor: "rgba(15, 108, 189, 0.1)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "grow-in": {
          "0%": { transform: "scaleY(0)", opacity: "0" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
        "window-open": {
          "0%": { transform: "scale(0.98)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "highlight-flash": "highlight-flash 0.9s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "grow-in": "grow-in 0.4s ease-out",
        "window-open": "window-open 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
