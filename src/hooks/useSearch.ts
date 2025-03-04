import { useState } from "react";
import { supabase } from "@utils/supabase";
import { UserProfile } from "@/types/profile";
import { useDebounce } from "./useDebounce";

export const useSearch = () => {
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(
          `username.ilike.%${query}%,` +
            `city.ilike.%${query}%,` +
            `country.ilike.%${query}%`
        )
        .limit(20);

      if (error) throw error;
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(searchUsers, 300);

  return {
    results,
    loading,
    search: debouncedSearch,
  };
};
