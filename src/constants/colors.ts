/**
 * Brand color tokens — keep in sync with tailwind.config.js
 * Use these constants wherever a color string is required in a JS/TS prop
 * (e.g. Ionicons `color`, ActivityIndicator `color`, StyleSheet values).
 * For NativeWind className props use the Tailwind tokens directly
 * (e.g. `text-primary`, `bg-primary-dark`, `text-secondary`).
 */
export const COLORS = {
  primary: '#9FD356',
  primaryLight: '#7AB82D',
  primaryDark: '#06AA4C',
  secondary: '#EE6612',
  /** Gradient start — used as LinearGradient `colors[0]` */
  primaryGradientFrom: '#89D151',
  /** Gradient end — used as LinearGradient `colors[1]` */
  primaryGradientTo: '#cef5b0',
  /** Hero / page-level background gradient tint */
  primaryGradientHero: '#B8E986',
} as const;

export type BrandColor = (typeof COLORS)[keyof typeof COLORS];
