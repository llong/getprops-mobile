import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Icon, useTheme } from "@rneui/themed";

interface SpotHeaderProps {
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

export const SpotHeader = memo(
  ({ name, address, city, country }: SpotHeaderProps) => {
    const { theme } = useTheme();

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text h3 style={styles.spotName}>
            {name}
          </Text>

          {address && (
            <View style={styles.addressContainer}>
              <Icon
                name="map-pin"
                type="feather"
                size={16}
                color={theme.colors.grey1}
                containerStyle={{ marginRight: 5 }}
              />
              <Text style={styles.addressText}>
                {address}
                {city ? `, ${city}` : ""}
                {country ? `, ${country}` : ""}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: "column",
  },
  spotName: {
    marginBottom: 5,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    flexShrink: 1,
  },
});
