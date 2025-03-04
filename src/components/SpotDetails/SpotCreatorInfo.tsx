import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Avatar } from "@rneui/themed";
import { format } from "date-fns";

interface SpotCreatorInfoProps {
  createdAt?: string;
  createdBy?: string;
  username?: string;
}

export const SpotCreatorInfo = memo(
  ({ createdAt, createdBy, username = "username" }: SpotCreatorInfoProps) => {
    console.log("[SpotCreatorInfo] createdAt:", createdAt);
    console.log("[SpotCreatorInfo] createdBy:", createdBy);
    console.log("[SpotCreatorInfo] username:", username);
    return (
      <View style={styles.createdByContainer}>
        <Text style={styles.createdByText}>
          Added {createdAt ? format(new Date(createdAt), "MMM d, yyyy") : ""}
        </Text>

        {Boolean(createdBy) && (
          <View style={styles.userInfoContainer}>
            <Avatar
              rounded
              containerStyle={styles.avatarContainer}
              size="small"
              title={createdBy ? createdBy.substring(0, 2).toUpperCase() : "??"}
            />
            <Text style={styles.usernameText}>@{username}</Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  createdByContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createdByText: {
    fontSize: 14,
    color: "#888",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 8,
  },
  usernameText: {
    fontSize: 14,
    color: "#666",
  },
});
