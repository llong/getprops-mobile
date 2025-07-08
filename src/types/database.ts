export enum SpotStatus {
  Active = "active",
  Flagged = "flagged",
  Removed = "removed",
}

export enum RiderType {
  Inline = "inline",
  Skateboard = "skateboard",
  BMX = "bmx",
  Scooter = "scooter",
}

export enum SpotType {
  Rail = "rail",
  Ledge = "ledge",
  Gap = "gap",
  WallRide = "wall_ride",
  Skatepark = "skatepark",
  ManualPad = "manual_pad",
}

export enum DifficultyLevel {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  rider_type: RiderType | null;
  bio: string | null;
  instagram_handle: string | null;
  spots_contributed: string[];
  liked_spots: string[];
  disliked_spots: string[];
  created_at: string;
  updated_at: string;
}

export interface Spot {
  id: string;
  name: string;
  description: string | null;
  spot_type: SpotType[];
  difficulty: DifficultyLevel;
  is_lit: boolean;
  kickout_risk: number;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  country: string | null;
  status: SpotStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  flag_count: number;
  photos: string[];
}

export interface SpotMedia {
  id: string;
  spotId: string;
  userId: string;
  type: "photo" | "video";
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpotVideo {
  id: string;
  spot_id: string;
  user_id: string;
  url: string;
  thumbnail_url: string;
  duration: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface SpotPhoto {
  id: string;
  spot_id: string;
  user_id: string;
  url: string;
  thumbnail_url: string | null;
  thumbnail_large_url: string | null;
  thumbnail_small_url: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface SpotFilters {
  spotType?: SpotType[];
  difficulty?: DifficultyLevel[];
  isLit?: boolean;
  maxDistance?: number;
  latitude?: number;
  longitude?: number;
  bounds?: {
    ne: { latitude: number; longitude: number };
    sw: { latitude: number; longitude: number };
  };
}

export interface Comment {
  id: string;
  spotId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = "photo" | "video";

export interface SpotFormData {
  name: string;
  description: string | null;
  spotType: SpotType[];
  difficulty: DifficultyLevel;
  isLit: boolean;
  kickoutRisk: number;
  latitude: number;
  longitude: number;
  streetNumber: string | null;
  street: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  postalCode: string | null;
  placeName: string | null;
}

export interface MediaTag {
  id: string;
  mediaId: string;
  userId: string;
  createdBy: string;
  createdAt: string;
}

export interface MediaLike {
  id: string;
  mediaId: string;
  userId: string;
  createdAt: string;
}

export interface MediaComment {
  id: string;
  mediaId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
