import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, useTheme } from "@rneui/themed";

interface LoadingSpinnerProps {
  fullscreen?: boolean;
  text?: string;
  size?: "small" | "large";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullscreen = true,
  text = "Loading...",
  size = "large",
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullscreen && styles.fullscreen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ActivityIndicator
        size={size}
        color={theme.colors.primary}
        style={styles.spinner}
      />
      <Text style={[styles.text, { color: theme.colors.grey3 }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreen: {
    flex: 1,
  },
  spinner: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
});
