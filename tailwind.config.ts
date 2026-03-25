import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Avenir Next'", "Avenir", "'Segoe UI'", "sans-serif"],
        body: ["'IBM Plex Sans'", "'Segoe UI'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 20px 50px rgba(15, 23, 42, 0.16)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.12) 1px, transparent 0)"
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        calendarium: {
          primary: "#0f766e",
          secondary: "#f97316",
          accent: "#dc2626",
          neutral: "#172033",
          "base-100": "#fffaf0",
          "base-200": "#f6efe0",
          "base-300": "#eadfc8",
          info: "#0ea5e9",
          success: "#15803d",
          warning: "#d97706",
          error: "#b91c1c"
        }
      }
    ]
  }
};

export default config;
