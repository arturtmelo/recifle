export const ROLES = ["POPULACAO", "FORNECEDOR", "CENTRO"] as const;
export type Role = (typeof ROLES)[number];

export const MATERIAL_TYPES = [
  "PLASTICO",
  "PAPEL",
  "VIDRO",
  "METAL",
  "ELETRONICO",
  "OLEO",
  "ORGANICO",
  "OUTROS",
] as const;
export type MaterialType = (typeof MATERIAL_TYPES)[number];

export const LISTING_STATUS = ["DISPONIVEL", "EM_NEGOCIACAO", "FECHADO", "CANCELADO"] as const;
export type ListingStatus = (typeof LISTING_STATUS)[number];

export const PRICE_TYPES = ["DOACAO", "VENDA"] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

export const NEGOTIATION_STATUS = ["ABERTA", "ACEITA", "RECUSADA", "CANCELADA"] as const;
export type NegotiationStatus = (typeof NEGOTIATION_STATUS)[number];

export const OFFER_TYPES = ["PROPOSTA", "CONTRA", "ACEITE", "RECUSA"] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export const DEAL_STATUS = [
  "CONFIRMADO",
  "COLETA_AGENDADA",
  "COLETADO",
  "CONCLUIDO",
  "CANCELADO",
] as const;
export type DealStatus = (typeof DEAL_STATUS)[number];

export const NOTIFICATION_TYPES = [
  "NOVA_PROPOSTA",
  "CONTRA_PROPOSTA",
  "PROPOSTA_ACEITA",
  "PROPOSTA_RECUSADA",
  "NOVA_MENSAGEM",
  "NEGOCIO_ATUALIZADO",
  "NOVA_AVALIACAO",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// kg acumulados para cada nível de gamificação do painel de impacto
export const ECO_LEVELS = [
  { level: "Bronze", minKg: 0 },
  { level: "Prata", minKg: 50 },
  { level: "Ouro", minKg: 200 },
  { level: "Platina", minKg: 500 },
] as const;

export function ecoLevelFor(kg: number): string {
  let current = ECO_LEVELS[0].level as string;
  for (const tier of ECO_LEVELS) {
    if (kg >= tier.minKg) current = tier.level;
  }
  return current;
}
