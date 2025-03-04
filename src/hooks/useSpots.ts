import { useState, useEffect, useCallback } from "react";
import { supabase } from "@utils/supabase";
import { useAuth } from "./useAuth";
import { Spot, SpotFormData, SpotType } from "@/types/database";

interface AddSpotData {
  name: string;
  description: string;
  spotType: SpotType[];
  difficulty: string;
  isLit: boolean;
  kickoutRisk: number;
  latitude: number;
  longitude: number;
}

interface UseSpots {
  addSpot: (data: SpotFormData) => Promise<Spot | undefined>;
  // ... other properties
}

export const useSpots = (spotId?: string) => {
  const [loading, setLoading] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const { user } = useAuth();

  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase.from("spots").select("*");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error details:", error);
      throw error;
    }
  };

  // Fetch spot details if spotId is provided
  const getSpot = async (id: string) => {
    if (!id) {
      console.error("No spot ID provided to getSpot");
      setLoading(false);
      setSpot(null);
      return null;
    }

    console.log(`[useSpots] Getting spot with ID: ${id}`);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("spots")
        .select("*, profiles(username)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching spot:", error);
        setSpot(null);
        return null;
      }

      if (!data) {
        console.warn(`No spot found with ID: ${id}`);
        setSpot(null);
        return null;
      }

      console.log(`[useSpots] Successfully fetched spot: ${data.name}`);
      setSpot(data);
      return data;
    } catch (error) {
      console.error("Error fetching spot details:", error);
      setSpot(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addSpot = async (formData: SpotFormData) => {
    if (!user) throw new Error("Must be logged in to add a spot");

    setLoading(true);
    try {
      // Create the spot record
      const { data, error } = await supabase
        .from("spots")
        .insert({
          name: formData.name,
          description: formData.description,
          spotType: formData.spotType,
          difficulty: formData.difficulty,
          isLit: formData.isLit,
          kickoutRisk: formData.kickoutRisk,
          latitude: formData.latitude,
          longitude: formData.longitude,
          city: formData.city,
          country: formData.country,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error adding spot:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const upvoteSpot = async (id: string) => {
    if (!user) throw new Error("Must be logged in to vote");

    const { error } = await supabase.rpc("upvote_spot", { spotId: id });
    if (error) throw error;
    await getSpot(id);
  };

  const downvoteSpot = async (id: string) => {
    if (!user) throw new Error("Must be logged in to vote");

    const { error } = await supabase.rpc("downvote_spot", { spotId: id });
    if (error) throw error;
    await getSpot(id);
  };

  // Fetch spot media (photos and videos) - memoized with useCallback
  const fetchSpotMedia = useCallback(
    async (id: string) => {
      if (!id) {
        console.error("No spot ID provided to fetchSpotMedia");
        return { photos: [], videos: [] };
      }

      try {
        // Perform parallel requests to improve performance
        const [photosResponse, videosResponse] = await Promise.all([
          supabase.from("spot_photos").select("*").eq("spot_id", id),
          supabase.from("spot_videos").select("*").eq("spot_id", id),
        ]);

        // Handle errors
        if (photosResponse.error) {
          console.error("Error fetching spot photos:", photosResponse.error);
        }

        if (videosResponse.error) {
          console.error("Error fetching spot videos:", videosResponse.error);
        }

        // Return the data, defaulting to empty arrays if null
        return {
          photos: photosResponse.data || [],
          videos: videosResponse.data || [],
        };
      } catch (error) {
        console.error("Error fetching spot media:", error);
        return { photos: [], videos: [] };
      }
    },
    [
      /* No dependencies needed as supabase is imported directly */
    ]
  );

  // Fetch spot on mount if spotId is provided
  useEffect(() => {
    console.log("[useSpots] spotId changed:", spotId);
    if (spotId) {
      getSpot(spotId);
    } else {
      // Clear spot data if no ID is provided
      setSpot(null);
      setLoading(false);
    }
  }, [spotId]);

  return {
    spot,
    loading,
    addSpot,
    getSpot,
    upvoteSpot,
    downvoteSpot,
    fetchSpots,
    fetchSpotMedia,
  };
};
