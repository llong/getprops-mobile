import { SpotType, DifficultyLevel } from "@/types/database";
import { Location } from "@/types/location";

export interface AddSpotFormData {
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

export interface AddSpotScreenProps {
  route: {
    params: {
      location: Location;
    };
  };
}

export interface LocationParams {
  latitude: number;
  longitude: number;
  streetNumber?: string | null;
  street?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
}
