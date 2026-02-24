/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "neon-green": "oklch(0.75 0.25 145)",
        "neon-cyan": "oklch(0.75 0.20 195)",
        "neon-blue": "oklch(0.65 0.25 240)",
        "neon-purple": "oklch(0.65 0.28 290)",
        "neon-pink": "oklch(0.70 0.27 350)",
        "neon-red": "oklch(0.65 0.30 25)",
        "neon-orange": "oklch(0.70 0.25 50)",
        "neon-yellow": "oklch(0.80 0.22 95)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography"), require("@tailwindcss/container-queries")],
  safelist: [
    "text-neon-green",
    "text-neon-cyan",
    "text-neon-blue",
    "text-neon-purple",
    "text-neon-pink",
    "text-neon-red",
    "text-neon-orange",
    "text-neon-yellow",
    "bg-neon-green",
    "bg-neon-cyan",
    "bg-neon-blue",
    "bg-neon-purple",
    "bg-neon-pink",
    "bg-neon-red",
    "bg-neon-orange",
    "bg-neon-yellow",
    "border-neon-green",
    "border-neon-cyan",
    "border-neon-blue",
    "border-neon-purple",
    "border-neon-pink",
    "border-neon-red",
    "border-neon-orange",
    "border-neon-yellow",
  ],
};
