import { useCallback, useState, useEffect } from "react";
import * as Location from "expo-location";
import type { Region } from "react-native-maps";
import type MapView from "react-native-maps";
import { Toast } from "react-native-toast-notifications";

const DEFAULT_REGION = {
  latitude: 43.0481, // Syracuse coordinates as fallback
  longitude: -76.1474,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const useMapInteractions = (mapRef: React.RefObject<MapView>) => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleRegionChange = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show("Location permission denied", {
          type: "warning",
          placement: "bottom",
          duration: 4000,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Toast.show("Error getting location", {
        type: "error",
        placement: "bottom",
        duration: 4000,
      });
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, []);

  return {
    getUserLocation,
    userLocation,
    region,
    handleRegionChange,
  };
};
