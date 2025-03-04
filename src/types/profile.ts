import { RiderType } from "./database";

export interface UserProfile {
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
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFormData {
  username: string;
  city?: string;
  country?: string;
  rider_type?: RiderType;
  bio?: string;
  instagram_handle?: string;
}
