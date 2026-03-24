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
        bg: "var(--bg)",
        fg: "var(--fg)",
        accent: "var(--accent)",
        "accent-light": "var(--accent-light)",
        muted: "var(--muted)",
        border: "var(--border)",
        surface: "var(--surface)",
        // Professional Enterprise Theme
        "pro-bg": "var(--pro-bg)",
        "pro-fg": "var(--pro-fg)",
        "pro-accent": "var(--pro-accent)",
        "pro-accent-hover": "var(--pro-accent-hover)",
        "pro-accent-light": "var(--pro-accent-light)",
        "pro-muted": "var(--pro-muted)",
        "pro-muted-light": "var(--pro-muted-light)",
        "pro-border": "var(--pro-border)",
        "pro-border-dark": "var(--pro-border-dark)",
        "pro-surface": "var(--pro-surface)",
        "pro-surface-hover": "var(--pro-surface-hover)",
        "pro-success": "var(--pro-success)",
        "pro-success-light": "var(--pro-success-light)",
        "pro-error": "var(--pro-error)",
        "pro-error-light": "var(--pro-error-light)",
        "pro-warning": "var(--pro-warning)",
        "pro-warning-light": "var(--pro-warning-light)",
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
