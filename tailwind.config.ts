import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        rpg: {
          dark: {
            bg: "#0B0F17",
            card: "#121927",
            border: "#1E293B",
            hover: "#1A2438",
          },
          gold: {
            DEFAULT: "#F59E0B",
            light: "#FCD34D",
            dark: "#B45309",
          },
          xp: {
            DEFAULT: "#38BDF8",
            glow: "#0284C7",
          },
          strength: "#EF4444",
          intellect: "#3B82F6",
          discipline: "#8B5CF6",
          creativity: "#EC4899",
          vitality: "#10B981",
          social: "#F97316",
        },
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "Cinzel", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "rpg-glow": "0 0 25px -5px rgba(56, 189, 248, 0.25)",
        "rpg-gold": "0 0 20px -3px rgba(245, 158, 11, 0.3)",
        "rpg-card": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
