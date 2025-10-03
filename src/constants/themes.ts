export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export const THEME_LABELS: Record<Theme, string> = {
  [THEMES.LIGHT]: "Light Mode",
  [THEMES.DARK]: "Dark Mode",
};
