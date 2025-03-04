import React from "react";
import { View, StyleSheet } from "react-native";
import { Switch, Text, useTheme } from "@rneui/themed";

interface LitToggleSectionProps {
  isLit: boolean;
  onLitToggle: (value: boolean) => void;
}

export const LitToggleSection: React.FC<LitToggleSectionProps> = ({
  isLit,
  onLitToggle,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Lit at Night</Text>
      <View style={styles.switchContainer}>
        <View style={styles.valueContainer}>
          <Text>{isLit ? "Yes" : "No"}</Text>
          <Switch
            value={isLit}
            onValueChange={onLitToggle}
            color={theme.colors.primary}
            style={styles.switch}
          />
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
  switchContainer: {
    paddingHorizontal: 10,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switch: {
    marginLeft: 4,
  },
});
