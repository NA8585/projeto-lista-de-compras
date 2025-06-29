export const palettes = {
  blue: {
    primary: '#007AFF'
  },
  green: {
    primary: '#34C759'
  },
  orange: {
    primary: '#FF9500'
  }
} as const;

export type PaletteName = keyof typeof palettes;

export interface ThemeColors {
  text: string;
  background: string;
  surface: string;
  primary: string;
}

export const baseColors = {
  light: {
    text: '#1C1C1E',
    background: '#F2F2F7',
    surface: '#FFFFFF'
  },
  dark: {
    text: '#FFFFFF',
    background: '#1C1C1E',
    surface: '#2C2C2E'
  }
} as const;

export type ColorScheme = keyof typeof baseColors;
