import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        "brand-gold":       "#F5A800",
        "brand-gold-light": "#FFD166",
        "brand-gold-dark":  "#C47F00",
        "brand-ink":        "#111111",
        "brand-dark":       "#1A0F00",
        "brand-earth":      "#3D2B00",
        "brand-sand":       "#FFF8EC",
        "brand-cream":      "#FFFDF7",
        "brand-muted":      "#8C7355",
        success: "#1D9E75",
        warning: "#EF9F27",
        danger:  "#E24B4A",
        info:    "#3A8FD4",
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "Syne", "system-ui", "sans-serif"],
        mono:    ["var(--font-syne-mono)", "Syne Mono", "monospace"],
        syne:    ["var(--font-syne)", "Syne", "system-ui", "sans-serif"],
        dm:      ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)",
        xl: "14px", "2xl": "18px",
      },
      boxShadow: {
        card:       "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-gold":"0 2px 12px rgba(245,168,0,0.18), 0 1px 3px rgba(0,0,0,0.06)",
      },
      animation: {
        "fade-up":   "fadeUp 0.4s ease-out forwards",
        "slide-down":"slideDown 0.3s ease-out forwards",
        "spin-slow": "spin 1.2s linear infinite",
      },
      keyframes: {
        fadeUp:    { "0%": { opacity:"0", transform:"translateY(20px)" }, "100%": { opacity:"1", transform:"translateY(0)" } },
        slideDown: { "0%": { opacity:"0", transform:"translateY(-10px)" }, "100%": { opacity:"1", transform:"translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
