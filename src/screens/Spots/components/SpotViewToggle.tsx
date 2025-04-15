import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SpotViewMode } from "@/types/ui";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@rneui/themed";

interface SpotViewToggleProps {
  isMapView: boolean;
  onToggle: (mode: SpotViewMode) => void;
  style?: object;
}

export const SpotViewToggle: React.FC<SpotViewToggleProps> = ({
  isMapView,
  onToggle,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={() => onToggle("map")} style={styles.button}>
        <FontAwesome
          name="map"
          size={22}
          color={isMapView ? theme.colors.primary : theme.colors.grey3}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onToggle("list")} style={styles.button}>
        <FontAwesome
          name="list"
          size={22}
          color={!isMapView ? theme.colors.primary : theme.colors.grey3}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 16,
    // flexGrow: 1, // Removed this line
  },
  button: {
    padding: 8,
  },
});
