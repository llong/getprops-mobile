import { atom } from "jotai";
import { atomWithAsyncStorage } from "../utils/cache";
import { Spot } from "../types/database";

// --- Types ---

interface CachedSpots {
  spots: Spot[];
  timestamp: number;
}

// --- Atoms ---

/**
 * This atom stores the main list of spots, persisted to AsyncStorage.
 * It includes both the spot data and a timestamp for caching logic.
 */
export const cachedSpotsAtom = atomWithAsyncStorage<CachedSpots | null>(
  "cachedSpots",
  null
);

/**
 * A derived atom that provides just the array of spots from the cache.
 * This is useful for components that only need to display the spot data.
 */
export const spotsAtom = atom(async (get) => {
  const cachedData = await get(cachedSpotsAtom);
  return cachedData?.spots ?? [];
});

/**
 * An atom to track the loading state of fetching spots.
 */
export const spotsLoadingAtom = atom(false);

/**
 * An atom to store any errors that occur while fetching spots.
 */
export const spotsErrorAtom = atom<string | null>(null);
