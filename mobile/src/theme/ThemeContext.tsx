import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { darkColors, lightColors, ThemeColors } from "./colors";

export type ThemeMode = "system" | "light" | "dark";

const THEME_MODE_KEY = "reclicla_theme_mode";

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    SecureStore.getItemAsync(THEME_MODE_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    SecureStore.setItemAsync(THEME_MODE_KEY, next).catch(() => {});
  }, []);

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(() => ({ mode, isDark, colors, setMode }), [mode, isDark, colors, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}

export function useThemeColors() {
  return useTheme().colors;
}
