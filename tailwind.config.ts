import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFB7C5",
          container: "#FFE4E1",
        },
        secondary: "#FF8E9E",
        tertiary: "#FFF5F0",
        "on-primary": "#8B2E3F",
        "on-surface": "#4A3236",
        surface: {
          DEFAULT: "#FFF9F9",
          elevated: "#FFFFFF",
          muted: "#FCE4E6",
        },
        "surface-container": "#FDF0F1",
        "surface-container-high": "#FCE4E6",
        outline: "#E6B8B8",
        accent: {
          DEFAULT: "#FF8E9E",
          muted: "#ff7d90",
          dim: "rgba(255, 142, 158, 0.18)",
        },
        border: {
          DEFAULT: "rgba(230, 184, 184, 0.45)",
          focus: "#FF8E9E",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta)",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
