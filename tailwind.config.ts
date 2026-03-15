import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pulse: {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#ef4444",
          blue: "#3b82f6",
        },
        hope: {
          blue: "#2E6DB4",
          "blue-dark": "#245A96",
          "blue-light": "#EBF2FA",
          green: "#5EA647",
          "green-light": "#EFF7EC",
          purple: "#6B3FA0",
          "purple-dark": "#583486",
          "purple-light": "#F3EEF9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
