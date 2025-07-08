import { useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { supabase } from "@/utils/supabase";
import { useAuth } from "./useAuth";
import { Spot, SpotFormData } from "@/types/database";
import {
  cachedSpotsAtom,
  spotsAtom,
  spotsLoadingAtom,
  spotsErrorAtom,
} from "@/state/spots";

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const useSpots = (spotId?: string) => {
  const { user } = useAuth();
  const [cachedSpots, setCachedSpots] = useAtom(cachedSpotsAtom);
  const [spots, setSpots] = useAtom(spotsAtom);
  const [loading, setLoading] = useAtom(spotsLoadingAtom);
  const [error, setError] = useAtom(spotsErrorAtom);

  const fetchSpots = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);

      const now = new Date().getTime();
      const isCacheValid =
        cachedSpots && now - cachedSpots.timestamp < CACHE_DURATION_MS;

      if (isCacheValid && !forceRefresh) {
        console.log("[useSpots] Using fresh data from cache.");
        setLoading(false);
        return;
      }

      console.log("[useSpots] Fetching fresh spots from Supabase.");
      try {
        const { data, error: fetchError } = await supabase
          .from("spots")
          .select("*");

        if (fetchError) {
          throw fetchError;
        }

        setCachedSpots({ spots: data, timestamp: new Date().getTime() });
      } catch (e: any) {
        console.error("Error fetching spots:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [cachedSpots, setCachedSpots, setLoading, setError]
  );

  const getSpot = async (id: string) => {
    // This can be optimized to pull from the cached list if available
    const existingSpot = spots.find((s) => s.id === id);
    if (existingSpot) {
      return existingSpot;
    }

    // If not found in cache, fetch directly
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("spots")
        .select("*, profiles(username)")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (e: any) {
      console.error("Error fetching spot details:", e);
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addSpot = async (formData: SpotFormData) => {
    if (!user) throw new Error("Must be logged in to add a spot");

    setLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from("spots")
        .insert({
          ...formData,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Invalidate cache to force a refresh on next load
      setCachedSpots(null);
      return data;
    } catch (e: any) {
      console.error("Error adding spot:", e);
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const upvoteSpot = async (id: string) => {
    if (!user) throw new Error("Must be logged in to vote");
    const { error } = await supabase.rpc("upvote_spot", { spot_id: id });
    if (error) throw error;
    fetchSpots(true); // Force refresh
  };

  const downvoteSpot = async (id: string) => {
    if (!user) throw new Error("Must be logged in to vote");
    const { error } = await supabase.rpc("downvote_spot", { spot_id: id });
    if (error) throw error;
    fetchSpots(true); // Force refresh
  };

  useEffect(() => {
    // Initial fetch when the hook mounts
    fetchSpots();
  }, [fetchSpots]);

  return {
    spots,
    loading,
    error,
    addSpot,
    getSpot,
    upvoteSpot,
    downvoteSpot,
    fetchSpots,
  };
};
