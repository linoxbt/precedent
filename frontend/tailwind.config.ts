import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1f3a5f",
          50: "#eef2f7",
          100: "#d6e0eb",
          200: "#adc2d7",
          300: "#82a2c1",
          400: "#5c85ac",
          500: "#3d6690",
          600: "#2c5074",
          700: "#1f3a5f",
          800: "#182d49",
          900: "#111f33",
        },
        parchment: {
          DEFAULT: "#faf8f4",
          100: "#fffefc",
          200: "#f5f1e8",
        },
        gold: {
          DEFAULT: "#b8924a",
          light: "#d4b678",
        },
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "'Times New Roman'", "serif"],
        sans: [
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 58, 95, 0.06), 0 4px 16px rgba(31, 58, 95, 0.08)",
        "card-hover": "0 2px 4px rgba(31, 58, 95, 0.08), 0 8px 24px rgba(31, 58, 95, 0.12)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "highlight-flash": {
          "0%": { backgroundColor: "rgba(184, 146, 74, 0.35)" },
          "100%": { backgroundColor: "rgba(184, 146, 74, 0.12)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "grow-in": {
          "0%": { transform: "scaleY(0)", opacity: "0" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "highlight-flash": "highlight-flash 0.9s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "grow-in": "grow-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
