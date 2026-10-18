// TypeScript mirror of CSS tokens from DESIGN.md
// These values must stay in sync with app/globals.css

export const colors = {
  green: {
    0: "#000000",
    10: "#002106",
    20: "#00390D",
    30: "#005314",
    40: "#006D1B",
    50: "#008723",
    60: "#00A22B",
    70: "#00BD34",
    80: "#00D93D",
    90: "#4EFF5E",
    95: "#B8FFC0",
    99: "#F2FFF0",
    100: "#FFFFFF",
  },
  neutral: {
    0: "#000000",
    10: "#1A1C19",
    20: "#2F312D",
    30: "#454843",
    40: "#5D6059",
    50: "#767971",
    60: "#90938A",
    70: "#ABAEA5",
    80: "#C6C9BF",
    90: "#E2E3DB",
    95: "#F1F1EA",
    99: "#FCFCF5",
    100: "#FFFFFF",
  },
  error: {
    40: "#BA1A1A",
    90: "#FFDAD6",
    99: "#FFF9F9",
  },
} as const;

export const typography = {
  sans: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const radius = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "28px",
  full: "9999px",
} as const;

export const duration = {
  short: "100ms",
  medium: "250ms",
  long: "400ms",
} as const;

export const easing = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

export const layout = {
  sidebarWidth: "280px",
  headerHeight: "64px",
} as const;
