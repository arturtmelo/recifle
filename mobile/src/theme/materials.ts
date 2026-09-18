import { materialColors } from "./colors";

export type MaterialType =
  | "PLASTICO"
  | "PAPEL"
  | "VIDRO"
  | "METAL"
  | "ELETRONICO"
  | "OLEO"
  | "ORGANICO"
  | "OUTROS";

export const MATERIAL_TYPES: MaterialType[] = [
  "PLASTICO",
  "PAPEL",
  "VIDRO",
  "METAL",
  "ELETRONICO",
  "OLEO",
  "ORGANICO",
  "OUTROS",
];

export const materialInfo: Record<
  MaterialType,
  { label: string; icon: keyof typeof import("@expo/vector-icons/MaterialCommunityIcons").default.glyphMap; color: string }
> = {
  PLASTICO: { label: "Plástico", icon: "bottle-soda-outline", color: materialColors.PLASTICO },
  PAPEL: { label: "Papel/Papelão", icon: "package-variant", color: materialColors.PAPEL },
  VIDRO: { label: "Vidro", icon: "bottle-wine-outline", color: materialColors.VIDRO },
  METAL: { label: "Metal", icon: "silverware-fork-knife", color: materialColors.METAL },
  ELETRONICO: { label: "Eletrônico", icon: "cellphone-cog", color: materialColors.ELETRONICO },
  OLEO: { label: "Óleo", icon: "oil", color: materialColors.OLEO },
  ORGANICO: { label: "Orgânico", icon: "leaf", color: materialColors.ORGANICO },
  OUTROS: { label: "Outros", icon: "dots-horizontal-circle-outline", color: materialColors.OUTROS },
};

export const roleLabels: Record<string, string> = {
  POPULACAO: "População",
  FORNECEDOR: "Fornecedor",
  CENTRO: "Centro de Reciclagem",
};
