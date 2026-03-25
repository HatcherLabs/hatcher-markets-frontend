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
        background: "#0a0a0f",
        foreground: "#fafafa",

        // Brand primary (purple)
        primary: {
          DEFAULT: '#8b5cf6',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          glow: 'rgba(139,92,246,0.15)',
        },

        // CTA accent (orange)
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          glow: 'rgba(249,115,22,0.15)',
        },

        // Semantic
        success: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        warning: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        error: {
          400: "#f87171",
          500: "#ef4444",
        },
        rating: {
          400: "#fbbf24",
          500: "#f59e0b",
        },

        // Text
        'text-primary': '#fafafa',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',

        // Border
        'border-default': 'rgba(255,255,255,0.06)',
        'border-hover': 'rgba(139,92,246,0.3)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(139,92,246,0.15), transparent)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
