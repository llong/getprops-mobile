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
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  riderType: RiderType | null;
  bio: string | null;
  instagramHandle: string | null;
  spotsContributed: string[];
  likedSpots: string[];
  dislikedSpots: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Spot {
  id: string;
  name: string;
  description: string | null;
  spotType: SpotType[];
  types: SpotType[];
  difficulty: DifficultyLevel;
  isLit: boolean;
  kickoutRisk: number;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  country: string | null;
  status: SpotStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  flagCount: number;
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

export interface SpotVideo extends SpotMedia {
  type: "video";
  duration: number;
  width: number;
  height: number;
  fileSize: number;
}

export interface SpotPhoto {
  id: string;
  mediaId: string;
  spotId: string;
  userId: string;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
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
