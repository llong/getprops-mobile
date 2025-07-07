import React, { useState, useCallback, useEffect } from "react";
import { View, FlatList } from "react-native";
import { Text, useTheme } from "@rneui/themed";
import { VideoItem } from "./components/VideoItem";
import { VideoControls } from "./components/VideoControls";
import { useVideoRefs } from "./hooks/useVideoRefs";
import {
  processVideoSelection,
  handleUpdateThumbnail,
  handleRemoveVideo,
} from "../../utils/videoHandlers";
import { styles } from "./styles";
import { VideoSelectorProps } from "./types";

const MAX_VIDEO_DURATION = 10;

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  videos,
  setVideos,
}) => {
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setVideoRef } = useVideoRefs();

  const handleVideoSelection = useCallback(
    async (recordVideo = false) => {
      try {
        setLoading(true);
        setError(null);
        // Call the refactored processVideoSelection, which now handles everything
        const newVideo = await processVideoSelection(
          recordVideo,
          MAX_VIDEO_DURATION
        );
        if (newVideo) {
          setVideos((prev) => [...prev, newVideo]);
        }
      } catch (err) {
        console.error("Error during video selection/processing:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to process video: ${message}. Please try again.`);
      } finally {
        setLoading(false);
      }
    },
    [setVideos, setLoading, setError]
  );

  // This function is now much simpler, it just calls the handler
  const handleSetThumbnailFromFrame = async (index: number, timeMs: number) => {
    const video = videos[index];
    if (video) {
      await handleUpdateThumbnail(video, setVideos, timeMs);
    }
  };

  const removeVideo = (index: number) => {
    const videoToRemove = videos[index];
    if (videoToRemove) {
      handleRemoveVideo(videoToRemove, setVideos);
    }
  };

  // This useEffect for react-native-video-trim is no longer needed here
  // as trimming is handled inside processVideoSelection.
  // It can be removed to simplify the component.
  useEffect(() => {
    // Optional: You could keep a listener for global errors from the trimmer if needed,
    // but for now, we assume errors are handled within the processing pipeline.
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Videos (max {MAX_VIDEO_DURATION} seconds each)
      </Text>

      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

      <VideoControls
        onRecordVideo={() => handleVideoSelection(true)}
        onChooseVideo={() => handleVideoSelection(false)}
        loading={loading}
        theme={theme}
      />

      {videos.length > 0 && (
        <FlatList
          data={videos}
          renderItem={({ item, index }) => (
            <VideoItem
              video={item}
              index={index}
              onRemove={() => removeVideo(index)}
              setVideoRef={setVideoRef}
              onSetThumbnailFromFrame={handleSetThumbnailFromFrame}
            />
          )}
          keyExtractor={(item) => item.uri}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoList}
        />
      )}
    </View>
  );
};
