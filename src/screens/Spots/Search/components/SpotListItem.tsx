import React from "react";
import { StyleSheet, View } from "react-native";
import { ListItem, Icon, Text, Avatar } from "@rneui/themed";
import { Spot, SpotType } from "@/types/database";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SpotsStackParamList } from "@/types/navigation";

interface SpotListItemProps {
  spot: Spot;
}

export const SpotListItem = ({ spot }: SpotListItemProps) => {
  const navigation = useNavigation<StackNavigationProp<SpotsStackParamList>>();

  const handlePress = () => {
    navigation.navigate("SpotDetails", { spotId: spot.id, spot });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "green";
      case "intermediate":
        return "orange";
      case "advanced":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <ListItem onPress={handlePress} bottomDivider>
      {spot.photos[0] ? (
        <Avatar
          source={{ uri: spot.photos[0] }}
          size={80}
          containerStyle={styles.image}
        />
      ) : null}

      <ListItem.Content>
        <ListItem.Title style={styles.title}>{spot.name}</ListItem.Title>
        <ListItem.Subtitle style={styles.location}>
          {spot.address}
        </ListItem.Subtitle>

        <View style={styles.details}>
          <Icon
            name={spot.isLit ? "lightbulb" : "lightbulb-o"}
            type="font-awesome"
            size={16}
            color={spot.isLit ? "#FFD700" : "gray"}
          />
          <Text
            style={[
              styles.tag,
              { backgroundColor: getDifficultyColor(spot.difficulty) },
            ]}
          >
            {spot.difficulty}
          </Text>
          {spot.spotType.map((type: SpotType) => (
            <Text key={type} style={styles.tag}>
              {type}
            </Text>
          ))}
          <Icon
            name="exclamation-triangle"
            type="font-awesome"
            size={16}
            color={spot.kickoutRisk > 3 ? "red" : "orange"}
          />
        </View>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  location: {
    color: "gray",
    fontSize: 14,
    marginBottom: 5,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
});
