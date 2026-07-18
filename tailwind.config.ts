import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Admin tokens — switch automatically when [data-admin-theme]
        // flips between dark (default) and light.
        admin: {
          bg: "var(--admin-bg)",
          surface: "var(--admin-surface)",
          "surface-2": "var(--admin-surface-2)",
          "surface-strong": "var(--admin-surface-strong)",
          border: "var(--admin-border)",
          "border-strong": "var(--admin-border-strong)",
          text: "var(--admin-text)",
          "text-muted": "var(--admin-text-muted)",
          "text-subtle": "var(--admin-text-subtle)",
          "text-faint": "var(--admin-text-faint)",
          accent: "var(--admin-accent)",
          "accent-fg": "var(--admin-accent-fg)",
        },
        ink: {
          950: "#06070d",
          900: "#0a0d16",
          800: "#0f1320",
          700: "#161b2e",
        },
        // Warm off-white page ground — printed paper, not screen white.
        paper: {
          DEFAULT: "#faf7f0",
          50: "#fdfbf7",
          100: "#f5f0e4",
        },
        // Single flat accent, taken from the golden knot of the app icon.
        brand: {
          50: "#fbf6e9",
          100: "#f5ebd0",
          300: "#ebc46e",
          400: "#e3af3f",
          500: "#d99b1e",
          600: "#b27c12",
          700: "#8a5f0d",
          900: "#573b08",
        },
        rose: {
          500: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
