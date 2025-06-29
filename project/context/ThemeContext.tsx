import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseColors, palettes, PaletteName, ThemeColors, ColorScheme } from '@/constants/Colors';

interface ThemeContextProps {
  colors: ThemeColors;
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  paletteName: PaletteName;
  setPalette: (name: PaletteName) => void;
}

const STORAGE_SCHEME = '@listavox:color_scheme';
const STORAGE_PALETTE = '@listavox:palette';

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [paletteName, setPaletteName] = useState<PaletteName>('blue');

  useEffect(() => {
    (async () => {
      const storedScheme = await AsyncStorage.getItem(STORAGE_SCHEME);
      const storedPalette = await AsyncStorage.getItem(STORAGE_PALETTE);
      if (storedScheme === 'light' || storedScheme === 'dark') {
        setColorScheme(storedScheme);
      }
      if (storedPalette && palettes[storedPalette as PaletteName]) {
        setPaletteName(storedPalette as PaletteName);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_SCHEME, colorScheme).catch(() => {});
  }, [colorScheme]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_PALETTE, paletteName).catch(() => {});
  }, [paletteName]);

  const toggleColorScheme = () => {
    setColorScheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setPalette = (name: PaletteName) => {
    setPaletteName(name);
  };

  const colors: ThemeColors = {
    ...baseColors[colorScheme],
    primary: palettes[paletteName].primary,
  };

  return (
    <ThemeContext.Provider value={{ colors, colorScheme, toggleColorScheme, paletteName, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
