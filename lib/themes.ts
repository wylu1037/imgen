export type StyleTheme = "notion" | "claude" | "lovable" | "vercel";

export const DEFAULT_THEME: StyleTheme = "notion";

export const THEMES: Array<{
  id: StyleTheme;
  name: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    primary: string;
    border: string;
    foreground: string;
    mutedForeground: string;
  };
}> = [
  {
    id: "notion",
    name: "Notion",
    description: "Warm minimalism, purple accents.",
    preview: {
      bg: "#ffffff",
      card: "#ffffff",
      primary: "#5645d4",
      border: "#e5e3df",
      foreground: "#1a1a1a",
      mutedForeground: "#787671",
    },
  },
  {
    id: "claude",
    name: "Claude",
    description: "Cream canvas, coral warmth.",
    preview: {
      bg: "#faf9f5",
      card: "#ffffff",
      primary: "#cc785c",
      border: "#e6dfd8",
      foreground: "#141413",
      mutedForeground: "#6c6a64",
    },
  },
  {
    id: "lovable",
    name: "Lovable",
    description: "Parchment cream, warm craft.",
    preview: {
      bg: "#f7f4ed",
      card: "#f7f4ed",
      primary: "#1c1c1c",
      border: "#eceae4",
      foreground: "#1c1c1c",
      mutedForeground: "#5f5f5d",
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Black precision, stark contrast.",
    preview: {
      bg: "#fafafa",
      card: "#ffffff",
      primary: "#171717",
      border: "#ebebeb",
      foreground: "#171717",
      mutedForeground: "#888888",
    },
  },
];

const VALID_THEMES = new Set<string>(THEMES.map((t) => t.id));

export function isValidTheme(value: string): value is StyleTheme {
  return VALID_THEMES.has(value);
}
