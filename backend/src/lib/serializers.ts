import { ecoLevelFor } from "./constants";

type UserWithExtras = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  addressText: string | null;
  lat: number | null;
  lng: number | null;
  totalKgRecycled: number;
  dealsCompleted: number;
  createdAt: Date;
  centerProfile?: {
    id: string;
    description: string | null;
    openingHours: string | null;
    verified: boolean;
    materials: { materialType: string }[];
  } | null;
};

export function toPublicUser(user: UserWithExtras) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    addressText: user.addressText,
    lat: user.lat,
    lng: user.lng,
    totalKgRecycled: user.totalKgRecycled,
    dealsCompleted: user.dealsCompleted,
    ecoLevel: ecoLevelFor(user.totalKgRecycled),
    createdAt: user.createdAt,
    centerProfile: user.centerProfile
      ? {
          id: user.centerProfile.id,
          description: user.centerProfile.description,
          openingHours: user.centerProfile.openingHours,
          verified: user.centerProfile.verified,
          materials: user.centerProfile.materials.map((m) => m.materialType),
        }
      : null,
  };
}

export function toPublicUserSummary(user: {
  id: string;
  name: string;
  avatarUrl: string | null;
  totalKgRecycled: number;
  dealsCompleted: number;
}) {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    ecoLevel: ecoLevelFor(user.totalKgRecycled),
    dealsCompleted: user.dealsCompleted,
  };
}
