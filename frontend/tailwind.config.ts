import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          green: "#d1fae5", // emerald-100
          mint: "#a7f3d0",  // emerald-200
          cream: "#fefce8", // Off-white cream
          surface: "#ffffff",
        },
        zinc: {
          50: "#fafaf9", // Warm white background
          800: "#27272a", // Text primary
        }
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(16, 185, 129, 0.1)',
        'float': '0 20px 50px -20px rgba(16, 185, 129, 0.15)',
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;