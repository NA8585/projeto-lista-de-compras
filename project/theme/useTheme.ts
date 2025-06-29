import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, ThemeName } from './themes';

interface ThemeCtx {
  name: ThemeName;
  spec: ReturnType<typeof getSpec>;
  setName: (name: ThemeName) => void;
}

function getSpec(name: ThemeName) {
  return themes[name];
}

const Ctx = createContext<ThemeCtx | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [name, setName] = useState<ThemeName>('sunriseGlass');
  const spec = getSpec(name);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(spec).forEach(([k, v]) => {
        if (Array.isArray(v)) return;
        root.style.setProperty(`--${k}`, v as string);
      });
    }
  }, [spec]);

  return <Ctx.Provider value={{ name, spec, setName }}>{children}</Ctx.Provider>;
};

export const useThemeSpec = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ThemeProvider missing');
  return ctx.spec;
};

export const useSetTheme = () => useContext(Ctx)!.setName;
