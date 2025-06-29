export const palettes = {
  fresh: {
    light: {
      background: '#F2F2F7',
      card: '#FFFFFF',
      text: '#1C1C1E',
      primary: '#007AFF',
      border: '#E5E5EA',
      secondaryText: '#8E8E93',
    },
    dark: {
      background: '#1C1C1E',
      card: '#2C2C2E',
      text: '#FFFFFF',
      primary: '#0A84FF',
      border: '#3A3A3C',
      secondaryText: '#8E8E93',
    },
  },
  sunset: {
    light: {
      background: '#FFF7F0',
      card: '#FFFFFF',
      text: '#2E1B18',
      primary: '#FF6B6B',
      border: '#FAD9C3',
      secondaryText: '#8E8E93',
    },
    dark: {
      background: '#2E1B18',
      card: '#3A2623',
      text: '#FFFFFF',
      primary: '#FF8F8F',
      border: '#66443D',
      secondaryText: '#C4B4B0',
    },
  },
} as const;

export type PaletteName = keyof typeof palettes;
