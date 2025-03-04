import React from "react";
import { View } from "react-native";
import { Text, Slider } from "@rneui/themed";
import { styles } from "../styles";
import { ThumbnailSliderProps } from "../types";

export const ThumbnailSlider: React.FC<ThumbnailSliderProps> = ({
  value,
  onChange,
  onComplete,
  maxDuration,
  theme,
}) => (
  <View style={styles.thumbnailControls}>
    <Text style={[styles.thumbnailLabel, { color: theme.colors.grey3 }]}>
      Select Thumbnail Position
    </Text>
    <Slider
      style={styles.slider}
      value={value}
      onValueChange={onChange}
      onSlidingComplete={onComplete}
      minimumValue={0}
      maximumValue={maxDuration}
      minimumTrackTintColor={theme.colors.primary}
      maximumTrackTintColor={theme.colors.grey3}
      thumbStyle={{ backgroundColor: theme.colors.primary }}
      step={1}
    />
  </View>
);
