import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { ISpot } from "@/types/spot";
import { StyleSheet, View } from "react-native";
import { AddSpotOverlay } from "@/screens/Spots/components/AddSpotOverlay";
import { SelectedSpotOverlay } from "../SelectedSpotOverlay/SelectedSpotOverlay";
import { theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useAtom } from "jotai";
import { DEFAULT_REGION, regionAtom, userLocationAtom } from "@/state/location";
import { useSpotSearch } from "@/hooks/useSpotSearch";
import * as Location from "expo-location";
import { debounce } from "lodash";
import InfoToast from "@components/InfoToast/InfoToast";
import { User } from "@supabase/supabase-js";
import { useToast } from "react-native-toast-notifications";

const SEARCH_DISTANCE = 50; // Add this constant

interface SpotMapProps {
  user: User | null;
  spots: ISpot[];
  region: Region;
  onRegionChangeComplete: (region: Region) => void;
  disableInteraction: boolean;
}

export const SpotMap: React.FC<SpotMapProps> = memo(
  ({ user, disableInteraction = false }) => {
    const toast = useToast();
    const [tempMarker, setTempMarker] = useState<{
      latitude: number;
      longitude: number;
      address: string;
      fullAddress: {
        name?: string;
        streetNumber?: string;
        street?: string;
        city?: string;
        region?: string;
        country?: string;
        postalCode?: string;
      };
    } | null>(null);
    const [selectedSpot, setSelectedSpot] = useState<ISpot | null>(null);
    const navigation = useNavigation();
    const [region, setRegion] = useAtom(regionAtom);
    const [userLocation, setUserLocation] = useAtom(userLocationAtom);
    const [showToast, setShowToast] = useState(false);
    const { results: spots, search } = useSpotSearch();
    const [isAddingSpot, setIsAddingSpot] = useState(false);
    const [lastSearchRegion, setLastSearchRegion] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);
    const mapRef = useRef<MapView>(null); // Restore explicit MapView type

    // Add a state to guard the initial search
    const [initialSearchDone, setInitialSearchDone] = useState(false);

    // New useEffect to trigger the initial search (and load markers) on mount
    useEffect(() => {
      if (!initialSearchDone && spots.length === 0) {
        // using the current region to perform the search
        search("", {
          maxDistance: SEARCH_DISTANCE,
          latitude: region.latitude,
          longitude: region.longitude,
        });
        setInitialSearchDone(true);
      }
    }, [initialSearchDone, spots, region.latitude, region.longitude, search]);

    // Optimize debouncedHandler to avoid unnecessary state updates
    const debouncedHandler = useMemo(
      () =>
        debounce((newRegion: Region) => {
          if (isAddingSpot) return;

          const { latitude, longitude } = newRegion;

          if (!lastSearchRegion) {
            Promise.all([
              setRegion(newRegion),
              setLastSearchRegion({ latitude, longitude }),
              search("", { maxDistance: SEARCH_DISTANCE, latitude, longitude }),
            ]);
            return;
          }

          const distance = Math.sqrt(
            Math.pow(latitude - lastSearchRegion.latitude, 2) +
              Math.pow(longitude - lastSearchRegion.longitude, 2)
          );

          if (distance > 0.1) {
            Promise.all([
              setRegion(newRegion),
              setLastSearchRegion({ latitude, longitude }),
              search("", { maxDistance: SEARCH_DISTANCE, latitude, longitude }),
            ]);
          }
        }, 500),
      [search, setRegion, isAddingSpot, lastSearchRegion]
    );

    // Optimize getUserLocation to batch state updates
    const getUserLocation = useCallback(async () => {
      toast.show("Getting your location...");
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          toast.show("Location permission was denied");
          setRegion(DEFAULT_REGION);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const newRegion = {
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
          latitude,
          longitude,
        };

        await Promise.all([
          setRegion(newRegion),
          setUserLocation({ latitude, longitude }),
          setLastSearchRegion({ latitude, longitude }),
          search("", { maxDistance: SEARCH_DISTANCE, latitude, longitude }),
        ]);

        mapRef.current?.animateToRegion(newRegion, 1000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get location";
        toast.show(errorMessage);
        setRegion(DEFAULT_REGION);
      }
    }, [setUserLocation, setRegion, search, toast]);

    const handleViewSpot = useCallback(
      (spot: ISpot) => {
        if (!spot) {
          console.error(
            "[SpotMap] Attempted to navigate to SpotDetails with no spot"
          );
          return;
        }

        // Ensure the spot object is complete and valid
        if (!spot.id) {
          console.error("[SpotMap] Spot is missing ID");
          return;
        }

        console.log(
          "[SpotMap] Navigating to SpotDetails with spot:",
          spot.name
        );

        // Create a clean spot object with essential properties
        const spotToPass = {
          id: spot.id,
          name: spot.name,
          description: spot.description ?? "",
          spotType: Array.isArray(spot.spotType)
            ? spot.spotType
            : [spot.spotType],
          difficulty: spot.difficulty ?? "intermediate",
          isLit: Boolean(spot.isLit),
          kickoutRisk: spot.kickoutRisk || 0,
          latitude: spot.latitude,
          longitude: spot.longitude,
          address: spot.address ?? "",
          city: spot.city ?? "",
          country: spot.country ?? "",
          createdBy: spot.createdBy,
          createdAt: spot.createdAt,
          photos: spot.photos || [],
        };

        navigation.navigate("SpotDetails", {
          spotId: spot.id,
          spot: spotToPass,
        });
        setSelectedSpot(null);
      },
      [navigation]
    );

    const handleEditSpot = useCallback(() => {
      if (!selectedSpot) return;
      navigation.navigate("EditSpot", { spotId: selectedSpot.id });
      setSelectedSpot(null);
    }, [selectedSpot, navigation]);

    const handleRegionChangeComplete = useMemo(
      () => (newRegion: Region) => {
        if (isAddingSpot) return;

        const hasSignificantChange =
          Math.abs(newRegion.latitude - region.latitude) > 0.05 ||
          Math.abs(newRegion.longitude - region.longitude) > 0.05;

        if (hasSignificantChange) {
          debouncedHandler(newRegion);
        }
      },
      [debouncedHandler, region.latitude, region.longitude, isAddingSpot]
    );

    const handleMapLongPress = useCallback(
      async (event: {
        nativeEvent: { coordinate: { latitude: number; longitude: number } };
      }) => {
        if (!user) {
          return;
        }

        const { latitude, longitude } = event.nativeEvent.coordinate;
        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          let constructedAddress = "";
          if (address.streetNumber && address.street) {
            constructedAddress = `${address.streetNumber} ${address.street}`;
          } else if (address.name && address.street) {
            constructedAddress = `${address.name} ${address.street}`;
          } else {
            constructedAddress = address.name ?? address.street ?? "";
          }

          setTempMarker({
            latitude,
            longitude,
            address: constructedAddress.trim(),
            fullAddress: {
              name: address.name ?? undefined,
              streetNumber: address.streetNumber ?? undefined,
              street: address.street ?? undefined,
              city: address.city ?? undefined,
              region: address.region ?? undefined,
              country: address.country ?? undefined,
              postalCode: address.postalCode ?? undefined,
            },
          });
          setIsAddingSpot(true);
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      },
      [user]
    );

    const handleMapPress = useCallback(() => {
      if (selectedSpot) {
        setSelectedSpot(null);
      }
    }, [selectedSpot]);

    const handleMarkerPress = useCallback((spot: ISpot) => {
      const compatibleSpot: ISpot = {
        ...spot,
        description: spot.description ?? "",
        spotType: Array.isArray(spot.spotType)
          ? spot.spotType
          : [spot.spotType],
      };
      setSelectedSpot(compatibleSpot);
    }, []);

    const handleAddSpotConfirm = useCallback(() => {
      if (tempMarker) {
        navigation.navigate("AddSpot", {
          location: {
            latitude: tempMarker.latitude,
            longitude: tempMarker.longitude,
            ...tempMarker.fullAddress,
          },
        });
        setTempMarker(null);
        setIsAddingSpot(false);
      }
    }, [navigation, tempMarker]);

    useEffect(() => {
      if (!userLocation) {
        getUserLocation();
      }
    }, [getUserLocation, userLocation]);

    useEffect(() => {
      if (user) {
        setShowToast(true);
      }
    }, [user]);

    useEffect(() => {
      return () => {
        debouncedHandler.cancel();
      };
    }, [debouncedHandler]);

    const memoizedSpots = useMemo(
      () =>
        spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            onPress={() => handleMarkerPress(spot)}
            title={spot.name}
            description={spot.description ?? ""}
          />
        )),
      [spots, handleMarkerPress]
    );

    return (
      <View style={styles.mapContainer}>
        {user && showToast && (
          <InfoToast
            message="Long press on the map to add a new spot"
            onClose={() => setShowToast(false)}
            duration={5000}
          />
        )}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // Revert to always using Google Maps
          style={styles.map}
          region={region}
          initialRegion={DEFAULT_REGION}
          showsUserLocation={true}
          showsMyLocationButton={true}
          userLocationUpdateInterval={5000}
          userLocationFastestInterval={5000}
          followsUserLocation={true}
          onRegionChangeComplete={handleRegionChangeComplete}
          onLongPress={handleMapLongPress}
          onPress={handleMapPress}
          minDelta={0.01}
          maxDelta={1.5}
          scrollEnabled={!disableInteraction}
          zoomEnabled={!disableInteraction}
          rotateEnabled={!disableInteraction}
          pitchEnabled={!disableInteraction}
        >
          {memoizedSpots}
          {tempMarker && (
            <Marker
              coordinate={{
                latitude: tempMarker.latitude,
                longitude: tempMarker.longitude,
              }}
              pinColor={theme.lightColors?.primary}
            />
          )}
        </MapView>
        {selectedSpot && (
          <SelectedSpotOverlay
            spot={selectedSpot}
            isVisible={!!selectedSpot}
            onClose={() => setSelectedSpot(null)}
            onView={handleViewSpot}
            onEdit={handleEditSpot}
            currentUser={user}
          />
        )}

        {isAddingSpot && tempMarker && (
          <AddSpotOverlay
            isVisible={isAddingSpot}
            address={tempMarker.address}
            fullAddress={tempMarker.fullAddress}
            onConfirm={handleAddSpotConfirm}
            onClose={() => setIsAddingSpot(false)}
          />
        )}
      </View>
    );
  }
);

// Add memo to prevent unnecessary re-renders
export default memo(SpotMap);

const styles = StyleSheet.create({
  map: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  mapContainer: {
    position: "absolute",
    flex: 1,
    height: "100%",
    width: "100%",
    overflow: "hidden",
  },
  loadingContainer: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 8,
  },
});
