import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Button, useTheme } from "@rneui/themed";

interface SpotActionsProps {
  onNavigate: () => void;
  onUpvote: () => void;
  onDownvote: () => void;
  onShare: () => void;
  upvoteCount?: number;
  downvoteCount?: number;
}

export const SpotActions = memo(
  ({
    onNavigate,
    onUpvote,
    onDownvote,
    onShare,
    upvoteCount = 0,
    downvoteCount = 0,
  }: SpotActionsProps) => {
    const { theme } = useTheme();

    return (
      <View style={styles.actionsContainer}>
        <Button
          icon={{
            name: "navigation",
            type: "feather",
            color: theme.colors.white,
            size: 20,
          }}
          title="Navigate"
          containerStyle={styles.actionButtonContainer}
          buttonStyle={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={onNavigate}
        />

        <View style={styles.voteContainer}>
          <Button
            icon={{
              name: "thumbs-up",
              type: "feather",
              color: theme.colors.white,
              size: 20,
            }}
            title={upvoteCount.toString()}
            containerStyle={styles.voteButtonContainer}
            buttonStyle={[
              styles.voteButton,
              { backgroundColor: theme.colors.success },
            ]}
            onPress={onUpvote}
          />

          <Button
            icon={{
              name: "thumbs-down",
              type: "feather",
              color: theme.colors.white,
              size: 20,
            }}
            title={downvoteCount.toString()}
            containerStyle={styles.voteButtonContainer}
            buttonStyle={[
              styles.voteButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={onDownvote}
          />
        </View>

        <Button
          icon={{
            name: "share",
            type: "feather",
            color: theme.colors.primary,
            size: 20,
          }}
          type="outline"
          title="Share"
          containerStyle={styles.actionButtonContainer}
          buttonStyle={styles.shareButton}
          titleStyle={{ color: theme.colors.primary }}
          onPress={onShare}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "column",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 10,
  },
  actionButtonContainer: {
    marginBottom: 10,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  voteButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  voteButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  shareButton: {
    borderRadius: 8,
    paddingVertical: 12,
    borderColor: "#ddd",
    borderWidth: 1,
  },
});
