import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Location } from "@/types/location";

interface LocationSectionProps {
  location: Location;
  latitude: number;
  longitude: number;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  location,
  latitude,
  longitude,
}) => {
  const formatAddress = () => {
    const parts = [];
    if (location.streetNumber && location.street) {
      parts.push(`${location.streetNumber} ${location.street}`);
    } else if (location.street) {
      parts.push(location.street);
    }

    if (location.city) {
      if (location.region) {
        parts.push(`${location.city}, ${location.region}`);
      } else {
        parts.push(location.city);
      }
    }

    if (location.country) {
      parts.push(location.country);
    }

    return parts;
  };

  const addressParts = formatAddress();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
        />
      </MapView>
      <View style={styles.addressOverlay}>
        <View style={styles.addressContainer}>
          {addressParts.map((part, index) => (
            <Text
              key={index}
              style={index === 0 ? styles.addressText : styles.addressDetails}
            >
              {part}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    overflow: "hidden",
  },
  addressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  addressContainer: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  addressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
});
