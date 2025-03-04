import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import { Text, useTheme } from "@rneui/themed";
import * as FileSystem from "expo-file-system";
import { VideoItem } from "./components/VideoItem";
import { VideoControls } from "./components/VideoControls";
import { ThumbnailSlider } from "./components/ThumbnailSlider";
import { useVideoRefs } from "./hooks/useVideoRefs";
import { useVideoProcessing } from "../../hooks/useVideoProcessing";
import { processVideoSelection } from "../../utils/videoHandlers";
import { styles } from "./styles";
import { VideoSelectorProps } from "./types";

const MAX_VIDEO_DURATION = 10;

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  videos,
  setVideos,
}) => {
  const { theme } = useTheme();
  const { error, setError, loading, setLoading, generateThumbnail } =
    useVideoProcessing(MAX_VIDEO_DURATION);
  const { setVideoRef, getVideoRef } = useVideoRefs();
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
    null
  );
  const [thumbnailTime, setThumbnailTime] = useState(0);

  const handleVideoSelection = useCallback(
    async (recordVideo = false) => {
      try {
        setLoading(true);
        setError(null);
        const newVideo = await processVideoSelection(
          recordVideo,
          MAX_VIDEO_DURATION,
          generateThumbnail
        );
        if (newVideo) {
          const newIndex = videos.length;
          setVideos((prev) => [...prev, newVideo]);
          setSelectedVideoIndex(newIndex);
          setThumbnailTime(0);

          setTimeout(() => {
            const videoRef = getVideoRef(newIndex);
            if (videoRef) {
              videoRef.loadAsync({ uri: newVideo.uri }, {}, false);
            }
          }, 0);
        }
      } catch (error) {
        setError("Failed to select video. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      setVideos,
      generateThumbnail,
      setError,
      setLoading,
      videos.length,
      getVideoRef,
    ]
  );

  const handleSetThumbnail = async (index: number) => {
    const videoRef = getVideoRef(index);
    if (videoRef) {
      const status = await videoRef.getStatusAsync();
      if (status.isLoaded) {
        const currentTime = status.positionMillis / 1000;
        const thumbnailUri = await generateThumbnail(
          videos[index].uri,
          currentTime
        );
        if (thumbnailUri) {
          setVideos((prev) =>
            prev.map((v, i) =>
              i === index ? { ...v, thumbnail: thumbnailUri } : v
            )
          );
        }
      }
    }
  };

  const handleThumbnailUpdate = async (index: number, time: number) => {
    try {
      setLoading(true);
      const videoRef = getVideoRef(index);
      if (videoRef) {
        await videoRef.pauseAsync();
      }
      const video = videos[index];
      const thumbnailUri = await generateThumbnail(video.uri, time);
      if (thumbnailUri) {
        setVideos((prev) =>
          prev.map((v, i) =>
            i === index ? { ...v, thumbnail: thumbnailUri } : v
          )
        );
      }
    } catch (error) {
      setError("Failed to update thumbnail");
    } finally {
      setLoading(false);
    }
  };

  const removeVideo = (index: number) => {
    setVideos((current) => current.filter((_, i) => i !== index));
    if (selectedVideoIndex === index) {
      setSelectedVideoIndex(null);
    }
  };

  // Handle file info check outside of deep nesting
  const handleVideoFileInfo = (
    fileInfo: FileSystem.FileInfo,
    fileUri: string,
    duration: number
  ) => {
    if (fileInfo.exists) {
      setVideos((prev) => [
        ...prev,
        {
          uri: fileUri,
          width: 0,
          height: 0,
          duration,
          type: "video",
          thumbnail: "",
        },
      ]);
    }
  };

  // Handle video processing error
  const handleVideoProcessingError = () => {
    setError("Failed to process video file");
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
    const subscription = eventEmitter.addListener("VideoTrim", (event) => {
      if (event.name === "onFinishTrimming") {
        const { outputPath, duration } = event;
        const fileUri = `file://${outputPath}`;

        FileSystem.getInfoAsync(fileUri)
          .then((fileInfo: FileSystem.FileInfo) =>
            handleVideoFileInfo(fileInfo, fileUri, duration)
          )
          .catch(handleVideoProcessingError);
      } else if (event.name === "onError") {
        setError(`Trimming error: ${event.message}`);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [setError, setVideos]);

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
              onSetThumbnail={handleSetThumbnail}
              onRemove={removeVideo}
              setVideoRef={setVideoRef}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoList}
        />
      )}

      {selectedVideoIndex !== null && videos[selectedVideoIndex] && (
        <ThumbnailSlider
          value={thumbnailTime}
          onChange={setThumbnailTime}
          onComplete={(value) =>
            handleThumbnailUpdate(selectedVideoIndex, value)
          }
          maxDuration={
            videos[selectedVideoIndex].duration ?? MAX_VIDEO_DURATION
          }
          theme={theme}
        />
      )}
    </View>
  );
};
