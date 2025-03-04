import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Chip, useTheme } from "@rneui/themed";
import { SpotType } from "@/types/database";

interface SpotTypeSectionProps {
  selectedTypes: SpotType[];
  onTypeToggle: (type: SpotType) => void;
}

export const SpotTypeSection = ({
  selectedTypes,
  onTypeToggle,
}: SpotTypeSectionProps) => {
  const { theme } = useTheme();

  // Use the enum values from SpotType
  const spotTypes = [
    SpotType.Rail,
    SpotType.Ledge,
    SpotType.Gap,
    SpotType.WallRide,
    SpotType.Skatepark,
    SpotType.ManualPad,
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Spot Type</Text>
      <View style={styles.chipContainer}>
        {spotTypes.map((type) => (
          <Chip
            key={type}
            title={type.replace("_", " ")}
            type={selectedTypes.includes(type) ? "solid" : "outline"}
            onPress={() => onTypeToggle(type)}
            containerStyle={styles.chip}
            buttonStyle={{
              backgroundColor: selectedTypes.includes(type)
                ? theme.colors.primary
                : theme.colors.grey3,
            }}
            titleStyle={{
              color: selectedTypes.includes(type)
                ? theme.colors.white
                : theme.colors.grey1,
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    margin: 2,
  },
});
