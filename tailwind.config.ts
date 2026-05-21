import type { Config } from "tailwindcss";

function rgbVar(name: string) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: rgbVar("--canvas"),
        surface: rgbVar("--surface"),
        "surface-muted": rgbVar("--surface-muted"),
        ink: rgbVar("--ink"),
        "ink-muted": rgbVar("--ink-muted"),
        "ink-faint": rgbVar("--ink-faint"),
        line: rgbVar("--line"),
        "line-strong": rgbVar("--line-strong"),
        primary: {
          DEFAULT: rgbVar("--primary"),
          hover: rgbVar("--primary-hover"),
          foreground: rgbVar("--primary-foreground"),
        },
        "accent-soft": rgbVar("--accent-soft"),
        overlay: rgbVar("--overlay"),
        status: {
          overdue: {
            bg: rgbVar("--status-overdue-bg"),
            border: rgbVar("--status-overdue-border"),
            text: rgbVar("--status-overdue-text"),
            bar: rgbVar("--status-overdue-bar"),
            track: rgbVar("--status-overdue-track"),
          },
          soon: {
            bg: rgbVar("--status-soon-bg"),
            border: rgbVar("--status-soon-border"),
            text: rgbVar("--status-soon-text"),
            bar: rgbVar("--status-soon-bar"),
            track: rgbVar("--status-soon-track"),
          },
          ok: {
            bg: rgbVar("--status-ok-bg"),
            border: rgbVar("--status-ok-border"),
            text: rgbVar("--status-ok-text"),
            bar: rgbVar("--status-ok-bar"),
            track: rgbVar("--status-ok-track"),
          },
          neutral: {
            bg: rgbVar("--status-neutral-bg"),
            border: rgbVar("--status-neutral-border"),
            text: rgbVar("--status-neutral-text"),
            bar: rgbVar("--status-neutral-bar"),
          },
        },
        danger: {
          DEFAULT: rgbVar("--danger"),
          hover: rgbVar("--danger-hover"),
        },
        warning: {
          border: rgbVar("--warning-border"),
          text: rgbVar("--warning-text"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "var(--radius-card)",
        modal: "var(--radius-modal)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        modal: "var(--shadow-modal)",
      },
    },
  },
  plugins: [],
};

export default config;
