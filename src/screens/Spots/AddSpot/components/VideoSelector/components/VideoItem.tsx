import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Video, ResizeMode } from "expo-av"; // Switch to expo-av
import { MaterialIcons } from "@expo/vector-icons";
import { Button, useTheme } from "@rneui/themed";
import { VideoAsset } from "@/types/media";

interface VideoItemProps {
  video: VideoAsset;
  index: number;
  onRemove: (index: number) => void;
  setVideoRef?: (index: number, ref: Video | null) => void; // Ref type is now expo-av Video
  onSetThumbnailFromFrame: (index: number, timeMillis: number) => Promise<void>;
}

export const VideoItem: React.FC<VideoItemProps> = ({
  video,
  index,
  onRemove,
  setVideoRef,
  onSetThumbnailFromFrame,
}) => {
  const videoRef = useRef<Video | null>(null);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();

  React.useEffect(() => {
    if (setVideoRef) {
      setVideoRef(index, videoRef.current);
    }
    return () => {
      if (setVideoRef) {
        setVideoRef(index, null);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [index, setVideoRef]);

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isPlaying) {
      // Auto-hide controls after 3 seconds
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const toggleControls = () => {
    const newState = !showControls;
    setShowControls(newState);

    // If showing again, set a timeout to auto-hide
    if (newState) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else if (hideTimeoutRef.current) {
      // If hiding manually, clear any pending timeout
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleSetCurrentFrameAsThumbnail = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isLoaded) {
        await videoRef.current.pauseAsync();
        await onSetThumbnailFromFrame(index, status.positionMillis);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        {video.uri ? (
          <Video
            ref={videoRef}
            style={styles.videoPlayerView}
            source={{ uri: video.uri }}
            useNativeControls={showControls}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={true}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        ) : (
          <View style={[styles.videoPlayerView, styles.placeholder]}>
            <MaterialIcons name="videocam-off" size={50} color="#999" />
          </View>
        )}

        {/* Thumbnail Preview Overlay */}
        {video.thumbnail && (
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.thumbnailPreview}
            resizeMode="cover"
          />
        )}

        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onRemove(index)}
          >
            <MaterialIcons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <Button
        title="Set Video Preview"
        onPress={handleSetCurrentFrameAsThumbnail}
        buttonStyle={[
          styles.setPreviewButton,
          { backgroundColor: theme.colors.primary },
        ]}
        titleStyle={styles.setPreviewButtonTitle}
        containerStyle={styles.setPreviewButtonContainer}
      />
    </View>
  );
};

const VIDEO_ITEM_WIDTH = 240;
const VIDEO_PLAYER_HEIGHT = 320;
const BUTTON_AREA_HEIGHT = 50;

const styles = StyleSheet.create({
  container: {
    width: VIDEO_ITEM_WIDTH,
    height: VIDEO_PLAYER_HEIGHT + BUTTON_AREA_HEIGHT,
    marginRight: 10,
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: VIDEO_PLAYER_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayerView: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  overlay: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailPreview: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 60,
    height: 80,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 2,
  },
  setPreviewButtonContainer: {
    marginTop: 8,
    width: "100%",
  },
  setPreviewButton: {
    borderRadius: 6,
    paddingVertical: 10,
  },
  setPreviewButtonTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
