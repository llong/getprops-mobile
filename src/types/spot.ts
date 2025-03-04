import { SpotType, DifficultyLevel } from "@/types/database";

export interface SpotImage {
  id: string;
  url: string;
  uri: string; // or any other properties you need
}

export interface ISpot {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  kickoutRisk: number;
  isLit: boolean;
  createdBy: string;
  photos: string[]; // This can be used to store URLs if needed
  distance?: string;
  placeName?: string;
  spotType: SpotType[];
  createdAt: string;
  updatedAt: string;
}

export interface SpotFormData {
  name: string;
  description: string;
  spotType: SpotType[];
  difficulty: DifficultyLevel;
  isLit: boolean;
  kickoutRisk: number;
  latitude: number;
  longitude: number;
  address: string;
  streetNumber: string;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  placeName: string;
}
