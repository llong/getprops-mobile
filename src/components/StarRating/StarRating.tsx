import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "@rneui/themed";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  onRatingChange: (rating: number) => void;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = 30,
  color = "#FFD700",
  onRatingChange,
}: StarRatingProps) => {
  return (
    <View style={styles.container}>
      {[...Array(maxRating)].map((_, index) => (
        <TouchableOpacity key={index} onPress={() => onRatingChange(index + 1)}>
          <Icon
            name={index < rating ? "star" : "star-o"}
            type="font-awesome"
            size={size}
            color={index < rating ? color : "#BDC3C7"}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 8,
    width: 200,
  },
  star: {
    marginRight: 8,
  },
});
