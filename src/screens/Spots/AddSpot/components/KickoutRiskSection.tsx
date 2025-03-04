import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Slider } from "@rneui/themed";

interface KickoutRiskSectionProps {
  kickoutRisk: number;
  onKickoutRiskChange: (value: number) => void;
}

export const KickoutRiskSection: React.FC<KickoutRiskSectionProps> = ({
  kickoutRisk,
  onKickoutRiskChange,
}) => {
  const getRiskLabel = (value: number): string => {
    switch (value) {
      case 1:
        return "Very Low";
      case 2:
        return "Low";
      case 3:
        return "Medium";
      case 4:
        return "High";
      case 5:
        return "Very High";
      default:
        return "Unknown";
    }
  };

  const getRiskColor = (value: number): string => {
    switch (value) {
      case 1:
        return "#4CAF50"; // Green
      case 2:
        return "#8BC34A"; // Light Green
      case 3:
        return "#FFC107"; // Amber
      case 4:
        return "#FF9800"; // Orange
      case 5:
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Grey
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Kickout Risk</Text>
      <View style={styles.sliderContainer}>
        <Slider
          value={kickoutRisk}
          onValueChange={onKickoutRiskChange}
          minimumValue={1}
          maximumValue={5}
          step={1}
          thumbStyle={[
            styles.thumb,
            { backgroundColor: getRiskColor(kickoutRisk) },
          ]}
          trackStyle={styles.track}
          minimumTrackTintColor={getRiskColor(kickoutRisk)}
          maximumTrackTintColor="#D1D1D1"
          thumbProps={{
            children: (
              <View style={{ backgroundColor: getRiskColor(kickoutRisk) }} />
            ),
          }}
        />
        <View style={styles.valueContainer}>
          <Text
            style={[styles.valueText, { color: getRiskColor(kickoutRisk) }]}
          >
            {getRiskLabel(kickoutRisk)} ({kickoutRisk}/5)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sliderContainer: {
    paddingHorizontal: 10,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  valueContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
