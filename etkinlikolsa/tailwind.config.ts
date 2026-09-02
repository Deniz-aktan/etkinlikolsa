import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1B3D",
          light: "#3A4360",
        },
        brand: {
          50: "#EFF5FF",
          100: "#DCE9FF",
          400: "#5B8DEF",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1A40AD",
        },
        sky: {
          light: "#60A5FA",
        },
        surface: "#F7F9FC",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px -8px rgba(15, 27, 61, 0.12)",
        float: "0 24px 48px -16px rgba(15, 27, 61, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
