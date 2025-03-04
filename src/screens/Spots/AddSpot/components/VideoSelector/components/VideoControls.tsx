import React from "react";
import { View } from "react-native";
import { Button } from "@rneui/themed";
import { styles } from "../styles";
import { VideoControlsProps } from "../types";

export const VideoControls: React.FC<VideoControlsProps> = ({
  onRecordVideo,
  onChooseVideo,
  loading,
  theme,
}) => (
  <View style={styles.buttonContainer}>
    <Button
      title="Record Video"
      icon={{
        name: "videocam",
        type: "material",
        size: 24,
        color: theme.colors.primary,
        style: { marginRight: 8 },
      }}
      containerStyle={styles.buttonContainerStyle}
      buttonStyle={{
        backgroundColor: "transparent",
        borderColor: theme.colors.primary,
        borderWidth: 2,
      }}
      titleStyle={{ color: theme.colors.primary }}
      onPress={onRecordVideo}
      loading={loading}
      disabled={loading}
      type="outline"
    />
    <Button
      title="Choose Video"
      icon={{
        name: "video-library",
        type: "material",
        size: 24,
        color: "white",
        style: { marginRight: 8 },
      }}
      containerStyle={styles.buttonContainerStyle}
      buttonStyle={{ backgroundColor: theme.colors.primary }}
      titleStyle={{ color: "white" }}
      onPress={onChooseVideo}
      loading={loading}
      disabled={loading}
    />
  </View>
);
