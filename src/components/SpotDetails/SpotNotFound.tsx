import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Icon, Button, useTheme } from "@rneui/themed";

interface SpotNotFoundProps {
  spotId?: string;
  routeParams: any;
  onGoBack: () => void;
}

export const SpotNotFound = memo(
  ({ spotId, routeParams, onGoBack }: SpotNotFoundProps) => {
    const { theme } = useTheme();

    return (
      <View style={styles.centeredContent}>
        <Icon
          name="alert-circle-outline"
          type="material-community"
          size={60}
          color={theme.colors.error}
        />
        <Text h4>Spot not found</Text>
        <Text style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}>
          The spot you're looking for could not be found or has been removed.
        </Text>
        <Text
          style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 10 }}
        >
          Debug info:
        </Text>
        <Text style={{ fontFamily: "monospace", fontSize: 12 }}>
          SpotID: {spotId || "undefined"}
        </Text>
        <Text style={{ fontFamily: "monospace", fontSize: 12 }}>
          Route params: {JSON.stringify(routeParams || {}, null, 2)}
        </Text>
        <Button
          title="Go Back"
          containerStyle={{ marginTop: 20 }}
          onPress={onGoBack}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
