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
        background: {
          DEFAULT: "#050811",
          secondary: "#080E1D",
          card: "#0D1528",
          cardHover: "#131F38",
        },
        primary: {
          DEFAULT: "#00F0FF",
          hover: "#00D2DF",
          light: "#38F8FF",
          dark: "#0891B2",
        },
        accent: {
          violet: "#8B5CF6",
          cyan: "#00F0FF",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        border: {
          DEFAULT: "rgba(0, 240, 255, 0.12)",
          subtle: "rgba(255, 255, 255, 0.06)",
          focus: "rgba(0, 240, 255, 0.5)",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

