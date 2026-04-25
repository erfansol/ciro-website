import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  safelist: [
    {
      pattern: /^(from|via|to)-(amber|rose|violet|fuchsia|indigo|sky|red|stone|slate|emerald|teal|orange|pink|brand)-(300|400|500|600|700|800)$/,
    },
    "bg-gradient-to-tr",
    "bg-gradient-to-br",
    "bg-gradient-to-t",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#06070d",
          900: "#0a0d16",
          800: "#0f1320",
          700: "#161b2e",
        },
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          900: "#4c1d95",
        },
        sun: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#ea580c",
        },
        rose: {
          500: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "sunset": "linear-gradient(120deg, #f59e0b 0%, #f43f5e 45%, #7c3aed 100%)",
        "aurora": "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 40%, #0a0d16 100%)",
        "grid-light": "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
        "grid-dark": "linear-gradient(rgba(167,139,250,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.08) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drift": {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(20px,-30px,0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "drift": "drift 14s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
