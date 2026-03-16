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
          DEFAULT: "#0f0a0d",
          elevated: "#1a1216",
          muted: "#1f151a",
        },
        accent: {
          DEFAULT: "#ec4899",
          muted: "#db2777",
          dim: "rgba(236, 72, 153, 0.14)",
        },
        border: {
          DEFAULT: "#2e2428",
          focus: "#ec4899",
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
