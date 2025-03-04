import "react-native-get-random-values";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  StyleProp,
  ViewStyle,
  Dimensions,
  Text,
} from "react-native";
import { useTheme } from "@rneui/themed";
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import { GOOGLE_API_KEY } from "@env";
import * as Location from "expo-location";
import debounce from "lodash/debounce";
import { supabase } from "@/utils/supabase";

interface SearchInputProps {
  onSearch: (query: string, location?: { lat: number; lng: number }) => void;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  onFocus?: () => void;
  onDismiss?: () => void;
}

interface SpotResult {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: "spot";
}

interface PlaceResult {
  description: string;
  placeId: string;
  type: "place";
  id?: string;
  name?: string;
}

type SearchResult = SpotResult | PlaceResult;

const { width } = Dimensions.get("window");

export const SearchInput = React.forwardRef<any, SearchInputProps>(
  (
    {
      onSearch,
      placeholder = "Search spots...",
      containerStyle,
      onFocus,
      onDismiss,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const autoCompleteRef = useRef(null);
    const [userLocation, setUserLocation] = useState<{
      lat: number;
      lng: number;
    } | null>(null);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // Get user's location on mount
    useEffect(() => {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      })();
    }, []);

    const searchSpots = async (query: string) => {
      try {
        // Clean and prepare the search query
        const cleanQuery = query.split(",")[0].trim(); // Take only the first part before any comma

        const { data, error } = await supabase
          .from("spots")
          .select("id, name, description, latitude, longitude")
          .textSearch("name", cleanQuery, {
            type: "plain",
            config: "english",
          })
          .limit(5);

        if (error) throw error;

        return data.map((spot) => ({
          ...spot,
          type: "spot" as const,
        }));
      } catch (error) {
        console.error("Error searching spots:", error);
        return [];
      }
    };

    const debouncedSpotSearch = useCallback(
      debounce(async (text: string) => {
        if (text.length < 2) return;

        const spots = await searchSpots(text);
        setSearchResults(spots);
      }, 300),
      []
    );

    const dismissSuggestions = () => {
      if (autoCompleteRef.current) {
        // @ts-ignore
        autoCompleteRef.current?.setAddressText("");
        Keyboard.dismiss();
      }
      setSearchResults([]);
      onDismiss?.();
    };

    // Expose dismiss method to parent
    React.useImperativeHandle(ref, () => ({
      dismissSuggestions,
    }));

    const handleSelect = (
      data: GooglePlaceData,
      details: GooglePlaceDetail | null
    ) => {
      if (details?.geometry?.location) {
        onSearch(data.description, {
          lat: details.geometry.location.lat,
          lng: details.geometry.location.lng,
        });
      }
      dismissSuggestions();
    };

    const handleSpotSelect = (spot: SpotResult) => {
      onSearch(spot.name, {
        lat: spot.latitude,
        lng: spot.longitude,
      });
      dismissSuggestions();
    };

    const renderSpotResults = () => {
      if (searchResults.length === 0) return null;

      return (
        <View style={styles.spotResultsContainer}>
          {searchResults.map((result) => {
            // Ensure we have the required properties
            const spotResult = result as SpotResult;
            return (
              <TouchableWithoutFeedback
                key={spotResult.id || Math.random().toString()}
                onPress={() => handleSpotSelect(spotResult)}
              >
                <View style={styles.spotResultRow}>
                  <Text style={styles.spotName}>
                    {spotResult.name || "Unnamed spot"}
                  </Text>
                  {Boolean(spotResult.description) && (
                    <Text style={styles.spotDescription} numberOfLines={1}>
                      {spotResult.description}
                    </Text>
                  )}
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
      );
    };

    return (
      <TouchableWithoutFeedback onPress={dismissSuggestions}>
        <View style={styles.container}>
          <TouchableWithoutFeedback>
            <View>
              <GooglePlacesAutocomplete
                ref={autoCompleteRef}
                placeholder={placeholder}
                minLength={1}
                fetchDetails={true}
                onPress={handleSelect}
                keyboardShouldPersistTaps="always"
                textInputProps={{
                  onFocus: () => onFocus?.(),
                  clearButtonMode: "while-editing",
                  onChangeText: (text: string) => {
                    debouncedSpotSearch(text);
                  },
                }}
                query={{
                  key: GOOGLE_API_KEY,
                  language: "en",
                  types: "establishment|geocode",
                  location: userLocation
                    ? `${userLocation.lat},${userLocation.lng}`
                    : undefined,
                  radius: "50000",
                  rankby: "distance",
                }}
                styles={{
                  container: {
                    flex: 0,
                    width: "100%",
                    zIndex: 1,
                  },
                  textInputContainer: {
                    backgroundColor: "transparent",
                  },
                  textInput: {
                    height: 45,
                    color: theme.colors.black,
                    fontSize: 16,
                  },
                  listView: {
                    backgroundColor: "white",
                    borderRadius: 8,
                    marginTop: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                    elevation: 3,
                    zIndex: 999,
                    width: width - 32,
                    marginLeft: -20,
                  },
                  row: {
                    backgroundColor: "white",
                    padding: 13,
                    height: "auto",
                    flexDirection: "row",
                  },
                }}
                enablePoweredByContainer={false}
                nearbyPlacesAPI="GooglePlacesSearch"
                GooglePlacesSearchQuery={{
                  location: userLocation
                    ? `circle:50000@${userLocation.lat},${userLocation.lng}`
                    : undefined,
                }}
                GooglePlacesDetailsQuery={{
                  fields: "geometry,formatted_address,name",
                }}
                renderRow={(rowData) => {
                  return (
                    <View style={styles.placeRow}>
                      <Text style={styles.placeName}>
                        {rowData.description}
                      </Text>
                    </View>
                  );
                }}
              />
              {renderSpotResults()}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 999,
    flexGrow: 1,
    flex: 1,
  },
  spotResultsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 998,
  },
  spotResultRow: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  spotName: {
    fontSize: 16,
    color: "#000",
  },
  spotDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  placeRow: {
    padding: 13,
  },
  placeName: {
    fontSize: 16,
    color: "#000",
  },
});
