import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";

interface SpotPhoto {
  id: string;
  fileUri: string;
  created_at: string;
}

interface SpotImages {
  [spotId: string]: string[];
}

interface UseSpotImagesResult {
  images: SpotImages;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSpotImages(spotId: string | null): UseSpotImagesResult {
  const [images, setImages] = useState<SpotImages>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!spotId) {
      setImages({});
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: photos, error: photosError } = await supabase
        .from("spot_photos")
        .select("*")
        .eq("spotId", spotId);

      console.log("Fetched Photos:", photos); // Debugging line
      if (photosError) throw photosError;

      const validUrls = (photos || [])
        .map((photo) => photo.url)
        .filter(Boolean) as string[];
      console.log("Valid URLs:", validUrls); // Debugging line
      setImages({ [spotId]: validUrls });
    } catch (err) {
      console.error("Error fetching spot images:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch images");
      setImages({ [spotId]: [] });
    } finally {
      setLoading(false);
    }
  }, [spotId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    loading,
    error,
    refetch: fetchImages,
  };
}
