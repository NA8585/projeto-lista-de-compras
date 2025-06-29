export type ThemeName = 'sunriseGlass' | 'nightfallGlass';

export interface ThemeSpec {
  background: string[];
  shapeA: string;
  shapeB: string;
  text: string;
  card: string;
  border: string;
  shadow: string;
  primary: string;
  accent: string;
}

export const themes: Record<ThemeName, ThemeSpec> = {
  sunriseGlass: {
    background: ['#FFFFFF', '#FFEED7', '#FFF1C1', '#F4FFD7'],
    shapeA: '#FFC475',
    shapeB: '#D0FFB3',
    text: '#1B1B1B',
    card: 'rgba(255,255,255,0.55)',
    border: 'rgba(255,255,255,0.8)',
    shadow: 'rgba(0,0,0,0.10)',
    primary: '#FF7F00',
    accent: '#FFBA7A',
  },
  nightfallGlass: {
    background: ['#0F1012', '#141515', '#1A1A16'],
    shapeA: '#4D390C',
    shapeB: '#374015',
    text: '#F5F5F5',
    card: 'rgba(40,40,40,0.55)',
    border: 'rgba(255,255,255,0.12)',
    shadow: 'rgba(0,0,0,0.45)',
    primary: '#FF7F00',
    accent: '#C74B00',
  },
};
