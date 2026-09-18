export type ThemeColors = typeof lightColors;

export const lightColors = {
  // Marca / eco
  primary: "#1B7A4D",
  primaryDark: "#0F5C38",
  primaryLight: "#E4F5EB",
  accent: "#2ECC71",
  amber: "#F5A623",

  // Neutros
  background: "#F7F9F7",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF3EE",
  border: "#E4E9E4",
  textPrimary: "#16241C",
  textSecondary: "#5B6B60",
  textMuted: "#93A196",
  white: "#FFFFFF",

  // Estado
  success: "#1B9C5A",
  warning: "#E8A93B",
  danger: "#E14C4C",
  info: "#3A8DDE",

  // Overlays
  overlay: "rgba(15, 30, 20, 0.55)",
  shadow: "rgba(20, 40, 28, 0.12)",
};

export const darkColors: ThemeColors = {
  // Marca / eco
  primary: "#34C77E",
  primaryDark: "#1B7A4D",
  primaryLight: "#163826",
  accent: "#3DDC84",
  amber: "#F5B84D",

  // Neutros
  background: "#0E1712",
  surface: "#17211B",
  surfaceAlt: "#1E2A22",
  border: "#2A362E",
  textPrimary: "#EDF3EE",
  textSecondary: "#A9B8AC",
  textMuted: "#718475",
  white: "#FFFFFF",

  // Estado
  success: "#34C77E",
  warning: "#F5B84D",
  danger: "#F27272",
  info: "#63A9F2",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.65)",
  shadow: "rgba(0, 0, 0, 0.4)",
};

// Cores por tipo de material — usadas em chips, ícones e badges. Constantes entre temas
// (cores de marca saturadas, já legíveis em fundo claro ou escuro).
export const materialColors: Record<string, string> = {
  PLASTICO: "#3A8DDE",
  PAPEL: "#E8A93B",
  VIDRO: "#2FB8A6",
  METAL: "#8A93A6",
  ELETRONICO: "#8B5CF6",
  OLEO: "#E8752B",
  ORGANICO: "#8C5A34",
  OUTROS: "#6B7280",
};

export const ecoLevelColors: Record<string, string> = {
  Bronze: "#B08D57",
  Prata: "#9AA5B1",
  Ouro: "#E8B93B",
  Platina: "#5EC8D8",
};
