import { useState, useCallback } from "react";
import { supabase } from "@utils/supabase";
import { ISpot } from "@/types/spot";

interface SearchLocation {
  latitude: number;
  longitude: number;
}

export const useSpotSearch = () => {
  const [results, setResults] = useState<ISpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (
      query: string,
      options?: {
        maxDistance?: number;
        latitude?: number;
        longitude?: number;
      }
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        // Take only the first part of the address before any comma to avoid SQL syntax errors
        const simplifiedQuery = query.split(",")[0].trim();

        let supabaseQuery = supabase.from("spots").select("*");

        if (simplifiedQuery) {
          // Use a simplified query that won't break with special characters
          supabaseQuery = supabaseQuery.ilike("name", `%${simplifiedQuery}%`);
        }

        const { data, error } = await supabaseQuery;

        if (error) {
          console.error("Search error:", error);
          setError(error.message);
          setResults([]);
        } else {
          setResults(data || []);
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("An unexpected error occurred");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { results, isLoading, error, search };
};
