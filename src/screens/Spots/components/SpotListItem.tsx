import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, Card, Icon, useTheme } from "@rneui/themed";
import { ISpot } from "@/types/spot";
import { SpotType } from "@/types/database";
import styles from "./SpotListItemStyles";

interface SpotListItemProps {
  spot: ISpot;
  onPress: () => void;
}

export const SpotListItem = ({ spot, onPress }: SpotListItemProps) => {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <View>
            <Text h4 style={styles.title}>
              {spot.name}
            </Text>
            <Text style={[styles.address, { color: theme.colors.grey1 }]}>
              {spot.address}
            </Text>
          </View>
          <View style={styles.stats}>
            <Icon
              name={spot.isLit ? "lightbulb" : "lightbulb-o"}
              type="font-awesome"
              color={spot.isLit ? theme.colors.warning : theme.colors.grey2}
              size={18}
            />
          </View>
        </View>

        <View style={styles.tags}>
          {spot.spotType.map((type: SpotType) => (
            <View
              key={type}
              style={[styles.tag, { backgroundColor: theme.colors.secondary }]}
            >
              <Text style={styles.tagText}>{type}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.difficulty}>
            <Icon
              name="signal"
              type="font-awesome"
              color={theme.colors.primary}
              size={16}
            />
            <Text style={styles.difficultyText}>{spot.difficulty}</Text>
          </View>
          <View style={styles.votes}>
            <Icon
              name="thumbs-up"
              type="font-awesome"
              color={theme.colors.success}
              size={16}
            />
            <Icon
              name="thumbs-down"
              type="font-awesome"
              color={theme.colors.error}
              size={16}
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
};

const localStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    margin: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distance: {
    fontSize: 14,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#000",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficulty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  difficultyText: {
    fontSize: 14,
    textTransform: "capitalize",
  },
  votes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
