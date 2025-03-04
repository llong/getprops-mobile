import { useEffect, useCallback, useState } from "react";
import { getDistance } from "geolib";
import debounce from "lodash.debounce";
import { supabase } from "@utils/supabase";
import { Region } from "react-native-maps";

export interface ISpot {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  kickoutRisk: number;
  isLit: boolean;
  createdBy: string;
  photos: {
    id: string;
    url: string;
  }[];
  distance?: string;
}

interface Bounds {
  ne: { latitude: number; longitude: number };
  sw: { latitude: number; longitude: number };
}

interface Location {
  latitude: number;
  longitude: number;
}

export function useSpotData(userLocation: Location | null, mapRegion: Region) {
  const [spots, setSpots] = useState<ISpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = useCallback(
    (spot: ISpot) => {
      if (!userLocation) return spot;

      const distance = getDistance(
        { latitude: spot.latitude, longitude: spot.longitude },
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        }
      );

      return {
        ...spot,
        distance: (distance / 1609.344).toFixed(2), // Convert meters to miles
      };
    },
    [userLocation]
  );

  const fetchSpotsWithinBounds = useCallback(
    async (bounds: Bounds) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("spots")
          .select(
            `
            *,
            photos (
              id,
              url,
              createdAt
            )
          `
          )
          .gt("latitude", bounds.sw.latitude)
          .lt("latitude", bounds.ne.latitude)
          .gt("longitude", bounds.sw.longitude)
          .lt("longitude", bounds.ne.longitude)
          .order("createdAt", { ascending: false });

        if (supabaseError) throw supabaseError;

        if (!data?.length) {
          setSpots([]);
          return;
        }

        const spotsWithDistance = data.map((spot: ISpot) =>
          calculateDistance(spot)
        );
        setSpots(spotsWithDistance);
      } catch (err) {
        console.error("Error fetching spots:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch spots");
        setSpots([]);
      } finally {
        setLoading(false);
      }
    },
    [calculateDistance]
  );

  const debouncedFetchSpots = useCallback(
    debounce(fetchSpotsWithinBounds, 500),
    [fetchSpotsWithinBounds]
  );

  useEffect(() => {
    const bounds = calculateBoundsFromRegion(mapRegion);
    debouncedFetchSpots(bounds);

    return () => {
      debouncedFetchSpots.cancel();
    };
  }, [mapRegion, debouncedFetchSpots]);

  return {
    spots,
    loading,
    error,
    fetchSpotsWithinBounds,
  };
}

function calculateBoundsFromRegion(region: Region): Bounds {
  return {
    ne: {
      latitude: region.latitude + region.latitudeDelta / 2,
      longitude: region.longitude + region.longitudeDelta / 2,
    },
    sw: {
      latitude: region.latitude - region.latitudeDelta / 2,
      longitude: region.longitude - region.longitudeDelta / 2,
    },
  };
}
