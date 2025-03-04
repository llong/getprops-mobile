import { LocationSuggestion } from "@/components/SearchInput/types";
import * as Location from "expo-location";

export const getLocationSuggestions = async (
  query: string
): Promise<LocationSuggestion[]> => {
  try {
    if (!query.trim()) return [];

    const locations = await Location.geocodeAsync(query);

    // Get location details including address
    const suggestions = await Promise.all(
      locations.slice(0, 5).map(async (location) => {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        const description = [address.city, address.region, address.country]
          .filter(Boolean)
          .join(", ");

        return {
          id: `${location.latitude}-${location.longitude}`,
          description,
          location: {
            lat: location.latitude,
            lng: location.longitude,
          },
        };
      })
    );

    return suggestions;
  } catch (error) {
    console.error("Error fetching location suggestions:", error);
    return [];
  }
};
