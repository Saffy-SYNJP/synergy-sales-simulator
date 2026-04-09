import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0a0f1a",
          surface: "#111827",
          card: "#1a2332",
          hover: "#1f2b3d",
          border: "#1e293b",
        },
        gold: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
          muted: "#92400e",
        },
        accent: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          green: "#10b981",
          red: "#ef4444",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(245, 158, 11, 0.15)",
        "glow-sm": "0 0 10px rgba(245, 158, 11, 0.1)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-card": "linear-gradient(135deg, #111827 0%, #1a2332 100%)",
        "gradient-gold": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-hero": "linear-gradient(180deg, #0a0f1a 0%, #111827 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.2)" },
          "50%": { boxShadow: "0 0 0 8px rgba(245, 158, 11, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
