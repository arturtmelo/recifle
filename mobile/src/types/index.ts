export type Role = "POPULACAO" | "FORNECEDOR" | "CENTRO";

export type CenterProfile = {
  id: string;
  description: string | null;
  openingHours: string | null;
  verified: boolean;
  materials: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  avatarUrl: string | null;
  bio: string | null;
  addressText: string | null;
  lat: number | null;
  lng: number | null;
  totalKgRecycled: number;
  dealsCompleted: number;
  ecoLevel: string;
  createdAt: string;
  centerProfile: CenterProfile | null;
  distanceKm?: number;
};

export type UserSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
  ecoLevel: string;
  dealsCompleted: number;
};

export type ListingStatus = "DISPONIVEL" | "EM_NEGOCIACAO" | "FECHADO" | "CANCELADO";
export type PriceType = "DOACAO" | "VENDA";

export type Listing = {
  id: string;
  materialType: string;
  title: string;
  description: string | null;
  quantityKg: number;
  status: ListingStatus;
  priceType: PriceType;
  pricePerKg: number | null;
  addressText: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  photos: string[];
  owner?: UserSummary;
  distanceKm?: number;
};

export type NegotiationStatus = "ABERTA" | "ACEITA" | "RECUSADA" | "CANCELADA";
export type OfferType = "PROPOSTA" | "CONTRA" | "ACEITE" | "RECUSA";

export type Offer = {
  id: string;
  authorId: string;
  type: OfferType;
  pricePerKg: number | null;
  quantityKg: number;
  message: string | null;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt: string | null;
};

export type Negotiation = {
  id: string;
  status: NegotiationStatus;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: string;
    title: string;
    materialType: string;
    quantityKg: number;
    priceType: PriceType;
    pricePerKg: number | null;
    status: ListingStatus;
    photo: string | null;
  };
  seller?: UserSummary;
  buyer?: UserSummary;
  offers?: Offer[];
  messages?: ChatMessage[];
  deal?: { id: string; status: DealStatus } | null;
};

export type DealStatus = "CONFIRMADO" | "COLETA_AGENDADA" | "COLETADO" | "CONCLUIDO" | "CANCELADO";

export type Review = {
  id: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string | null;
};

export type Deal = {
  id: string;
  status: DealStatus;
  finalPricePerKg: number | null;
  finalQuantityKg: number;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  listing?: { id: string; title: string; materialType: string; photo: string | null };
  seller?: UserSummary;
  buyer?: UserSummary;
  reviews?: Review[];
};

export type NotificationType =
  | "NOVA_PROPOSTA"
  | "CONTRA_PROPOSTA"
  | "PROPOSTA_ACEITA"
  | "PROPOSTA_RECUSADA"
  | "NOVA_MENSAGEM"
  | "NEGOCIO_ATUALIZADO"
  | "NOVA_AVALIACAO";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: string | null;
  read: boolean;
  createdAt: string;
};
