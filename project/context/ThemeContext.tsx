import React, { createContext, useContext, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  primary: string;
}

interface ThemeContextProps {
  colorScheme: ColorSchemeName;
  colors: ThemeColors;
  toggleScheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#1C1C1E',
  primary: '#007AFF',
};

const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  primary: '#0A84FF',
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [scheme, setScheme] = useState<ColorSchemeName>(systemScheme ?? 'light');

  const toggleScheme = () => {
    setScheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const colors = scheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colorScheme: scheme, colors, toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
