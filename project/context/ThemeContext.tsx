import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, PaletteName } from '../constants/Colors';
import { setItem, getItem } from '../services/storage';
import { useSetTheme } from '@/theme/useTheme';
import { ThemeName } from '@/theme/themes';

interface ThemeContextType {
  colors: typeof palettes.fresh.light;
  paletteName: PaletteName;
  colorScheme: 'light' | 'dark';
  setPalette: (name: PaletteName) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemScheme = useColorScheme();
  const setThemeName = useSetTheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemScheme || 'light');
  const [paletteName, setPaletteName] = useState<PaletteName>('fresh');

  React.useEffect(() => {
    const loadTheme = async () => {
      const savedPalette = await getItem<PaletteName>('theme_palette');
      const savedScheme = await getItem<'light' | 'dark'>('theme_scheme');
      if (savedPalette) {
        setPaletteName(savedPalette);
        if (savedPalette === 'sunriseGlass' || savedPalette === 'nightfallGlass') {
          setThemeName(savedPalette as ThemeName);
        }
      }
      if (savedScheme) {
        setColorScheme(savedScheme);
      } else {
        setColorScheme(systemScheme || 'light');
      }
    };
    loadTheme();
  }, [systemScheme]);

  const setPalette = async (name: PaletteName) => {
    setPaletteName(name);
    await setItem('theme_palette', name);
    if (name === 'sunriseGlass' || name === 'nightfallGlass') {
      setThemeName(name as ThemeName);
    }
  };

  const toggleColorScheme = async () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
    await setItem('theme_scheme', newScheme);
  };

  const colors = palettes[paletteName][colorScheme];

  const contextValue = useMemo(() => ({
    colors,
    paletteName,
    setPalette,
    colorScheme,
    toggleColorScheme,
  }), [colors, paletteName, colorScheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
