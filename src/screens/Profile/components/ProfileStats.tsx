import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@rneui/themed";
import { UserProfile } from "@types/profile";

interface ProfileStatsProps {
  profile: UserProfile | null;
}

export const ProfileStats = ({ profile }: ProfileStatsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text h4>{profile?.spots_contributed.length || 0}</Text>
        <Text>Spots</Text>
      </View>
      <View style={styles.stat}>
        <Text h4>{profile?.liked_spots.length || 0}</Text>
        <Text>Liked</Text>
      </View>
      <View style={styles.stat}>
        <Text h4>{profile?.rider_type || "-"}</Text>
        <Text>Rides</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  stat: {
    alignItems: "center",
  },
});
