import React from "react";
import { View, StyleSheet } from "react-native";
import { Overlay, Text, Button } from "@rneui/themed";

interface AddSpotOverlayProps {
  isVisible: boolean;
  address: string;
  fullAddress: {
    name?: string;
    streetNumber?: string;
    street?: string;
    city?: string;
    region?: string;
    country?: string;
    postal_code?: string;
  };
  onClose: () => void;
  onConfirm: () => void;
}

export const AddSpotOverlay = ({
  isVisible,
  address,
  fullAddress,
  onClose,
  onConfirm,
}: AddSpotOverlayProps) => {
  const formatFullAddress = () => {
    const parts = [];
    if (fullAddress.city)
      parts.push(
        `${fullAddress.city}, ${fullAddress.region} ${fullAddress.postal_code}`
      );
    if (fullAddress.country) parts.push(fullAddress.country);

    return parts.join("\n");
  };

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={[styles.overlay]}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Add New Spot</Text>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.fullAddress}>{formatFullAddress()}</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            type="clear"
            onPress={onClose}
            containerStyle={styles.buttonLeft}
          />
          <Button
            title="Add Spot"
            onPress={onConfirm}
            containerStyle={styles.buttonRight}
          />
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 20,
    width: "90%",
    maxHeight: "30%",
    borderRadius: 16,
    backgroundColor: "white",
    padding: 16,
  },
  container: {
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    marginBottom: 4,
  },
  fullAddress: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  buttonLeft: {
    flex: 1,
  },
  buttonRight: {
    flex: 1,
  },
});
