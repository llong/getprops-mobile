import { Geometry } from "./postgis";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatarUrl: string | null;
          bio: string | null;
          city: string | null;
          country: string | null;
          createdAt: string | null;
          dislikedSpots: string[] | null;
          id: string;
          instagramHandle: string | null;
          likedSpots: string[] | null;
          riderType: string | null;
          spotsContributed: string[] | null;
          updatedAt: string | null;
          username: string;
        };
        Insert: {
          avatarUrl?: string | null;
          bio?: string | null;
          city?: string | null;
          country?: string | null;
          createdAt?: string | null;
          dislikedSpots?: string[] | null;
          id: string;
          instagramHandle?: string | null;
          likedSpots?: string[] | null;
          riderType?: string | null;
          spotsContributed?: string[] | null;
          updatedAt?: string | null;
          username: string;
        };
        Update: {
          avatarUrl?: string | null;
          bio?: string | null;
          city?: string | null;
          country?: string | null;
          createdAt?: string | null;
          dislikedSpots?: string[] | null;
          id?: string;
          instagramHandle?: string | null;
          likedSpots?: string[] | null;
          riderType?: string | null;
          spotsContributed?: string[] | null;
          updatedAt?: string | null;
          username?: string;
        };
      };
      spots: {
        Row: {
          address: string | null;
          city: string | null;
          country: string | null;
          createdAt: string | null;
          createdBy: string;
          description: string | null;
          difficulty: string;
          id: string;
          isLit: boolean | null;
          kickoutRisk: number;
          latitude: number;
          location: Geometry | null;
          longitude: number;
          name: string;
          spotType: Database["public"]["Enums"]["spot_type_enum"][] | null;
          updatedAt: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          country?: string | null;
          createdAt?: string | null;
          createdBy: string;
          description?: string | null;
          difficulty: string;
          id?: string;
          isLit?: boolean | null;
          kickoutRisk: number;
          latitude: number;
          location?: Geometry | null;
          longitude: number;
          name: string;
          spotType?: Database["public"]["Enums"]["spot_type_enum"][] | null;
          updatedAt?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          country?: string | null;
          createdAt?: string | null;
          createdBy?: string;
          description?: string | null;
          difficulty?: string;
          id?: string;
          isLit?: boolean | null;
          kickoutRisk?: number;
          latitude?: number;
          location?: Geometry | null;
          longitude?: number;
          name?: string;
          spotType?: Database["public"]["Enums"]["spot_type_enum"][] | null;
          updatedAt?: string | null;
        };
      };
      spot_media: {
        Row: {
          createdAt: string | null;
          id: string;
          spotId: string | null;
          type: Database["public"]["Enums"]["media_type_enum"] | null;
          url: string;
          userId: string | null;
        };
        Insert: {
          createdAt?: string | null;
          id?: string;
          spotId?: string | null;
          type?: Database["public"]["Enums"]["media_type_enum"] | null;
          url: string;
          userId?: string | null;
        };
        Update: {
          createdAt?: string | null;
          id?: string;
          spotId?: string | null;
          type?: Database["public"]["Enums"]["media_type_enum"] | null;
          url?: string;
          userId?: string | null;
        };
      };
    };
    Enums: {
      media_type_enum: "photo" | "video";
      spot_type_enum:
        | "rail"
        | "ledge"
        | "gap"
        | "wall_ride"
        | "skatepark"
        | "manual_pad";
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
