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
        surface: {
          DEFAULT: "#0d0d0f",
          elevated: "#161618",
          muted: "#1c1c1f",
        },
        accent: {
          DEFAULT: "#00d4aa",
          muted: "#00a884",
          dim: "rgba(0, 212, 170, 0.12)",
        },
        border: {
          DEFAULT: "#2a2a2e",
          focus: "#00d4aa",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
