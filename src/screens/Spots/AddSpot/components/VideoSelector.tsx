import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  NativeEventEmitter,
  NativeModules,
  Image,
} from "react-native";
import { Button, Text, useTheme } from "@rneui/themed";
import { Video, ResizeMode } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { VideoAsset } from "@/types/media";
import { processVideoSelection } from "../utils/videoHandlers";
import { useVideoProcessing } from "../hooks/useVideoProcessing";
import * as FileSystem from "expo-file-system";

interface VideoSelectorProps {
  videos: VideoAsset[];
  setVideos: React.Dispatch<React.SetStateAction<VideoAsset[]>>;
}

interface ExtendedVideoAsset extends VideoAsset {
  thumbnailTime?: number;
}

const MAX_VIDEO_DURATION = 10;
const SCREEN_WIDTH = Dimensions.get("window").width;
const VIDEO_WIDTH = Math.min(300, SCREEN_WIDTH - 40); // 40px for padding

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  videos,
  setVideos,
}) => {
  const { theme } = useTheme();
  const { error, setError, loading, setLoading, generateThumbnail } =
    useVideoProcessing(MAX_VIDEO_DURATION);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
    null
  );
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(
    null
  );

  // Create refs for each video
  const videoRefs = React.useRef<{ [key: number]: Video | null }>({});

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
          addNewVideo(newVideo);
        }
      } catch (error) {
        console.error("Error selecting video:", error);
        setError("Failed to select video. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [setVideos, generateThumbnail, setError, setLoading, videos.length]
  );

  const addNewVideo = (newVideo: VideoAsset) => {
    const newIndex = videos.length;
    setVideos((prev) => [...prev, newVideo]);
    setSelectedVideoIndex(newIndex);

    setTimeout(() => {
      const videoRef = videoRefs.current[newIndex];
      if (videoRef) {
        videoRef.loadAsync({ uri: newVideo.uri }, {}, false);
      }
    }, 0);
  };

  // Handle video playback status
  const handlePlaybackStatusUpdate = async (status: any, index: number) => {
    try {
      if (status.error) {
        console.error("Video playback error:", status.error);
        return;
      }

      if (status.isPlaying) {
        // If a different video starts playing, pause the previously playing video
        if (playingVideoIndex !== null && playingVideoIndex !== index) {
          const prevVideoRef = videoRefs.current[playingVideoIndex];
          if (prevVideoRef) {
            await prevVideoRef.pauseAsync();
          }
        }
        setPlayingVideoIndex(index);
      } else if (!status.isPlaying && playingVideoIndex === index) {
        setPlayingVideoIndex(null);
      }
    } catch (error) {
      console.error("Error handling playback status:", error);
    }
  };

  // Pause all videos
  const pauseAllVideos = async () => {
    try {
      await Promise.all(
        Object.entries(videoRefs.current).map(async ([_, ref]) => {
          if (ref) {
            await ref.pauseAsync();
          }
        })
      );
      setPlayingVideoIndex(null);
    } catch (error) {
      console.error("Error pausing videos:", error);
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      pauseAllVideos();
    };
  }, []);

  const removeVideo = async (index: number) => {
    try {
      const videoRef = videoRefs.current[index];
      if (videoRef) {
        if (playingVideoIndex === index) {
          await videoRef.pauseAsync();
          setPlayingVideoIndex(null);
        }
        await videoRef.unloadAsync();
        delete videoRefs.current[index];
      }
      setVideos((current) => current.filter((_, i) => i !== index));
      if (selectedVideoIndex === index) {
        setSelectedVideoIndex(null);
      }
    } catch (error) {
      console.error("Error removing video:", error);
    }
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
    const subscription = eventEmitter.addListener("VideoTrim", (event) => {
      if (event.name === "onFinishTrimming") {
        handleFinishTrimming(event);
      } else if (event.name === "onCancelTrimming") {
        console.log("Trimming cancelled:", event);
      } else if (event.name === "onError") {
        console.error("Trimming error:", event);
        setError(`Trimming error: ${event.message}`);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleFinishTrimming = (event: any) => {
    const { outputPath, duration } = event;
    const fileUri = `file://${outputPath}`;

    FileSystem.getInfoAsync(fileUri)
      .then((fileInfo: FileSystem.FileInfo) => {
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
        } else {
          console.error("Trimmed file does not exist:", fileUri);
        }
      })
      .catch((error) => {
        console.error("Error checking file existence:", error);
      });
  };

  const updateVideoThumbnail = async (
    index: number,
    videoRef: Video,
    uri: string
  ) => {
    const status = await videoRef.getStatusAsync();
    if (!status.isLoaded) return;

    const currentTime = status.positionMillis / 1000;
    const thumbnailUri = await generateThumbnail(uri, currentTime);
    if (!thumbnailUri) return;

    setVideos((prev) =>
      prev.map((v, i) => (i === index ? { ...v, thumbnail: thumbnailUri } : v))
    );
  };

  const renderVideo = ({
    item: video,
    index,
  }: {
    item: VideoAsset;
    index: number;
  }) => {
    if (!video.uri) {
      return null;
    }

    const handleSetThumbnail = async () => {
      try {
        const videoRef = videoRefs.current[index];
        if (!videoRef) return;

        await videoRef.pauseAsync();
        await updateVideoThumbnail(index, videoRef, video.uri);
      } catch (error) {
        console.error("Error setting thumbnail:", error);
        setError("Failed to set thumbnail");
      }
    };

    return (
      <View key={`${video.uri}-${index}`} style={styles.videoWrapper}>
        <TouchableOpacity
          style={styles.deleteVideoContainer}
          onPress={() => removeVideo(index)}
        >
          <MaterialIcons name="close" size={16} color="white" />
        </TouchableOpacity>
        <Video
          ref={(ref) => {
            videoRefs.current[index] = ref;
          }}
          source={{ uri: video.uri }}
          style={styles.video}
          useNativeControls={true}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={false}
          posterSource={{ uri: video.thumbnail ?? undefined }}
          usePoster={!!video.thumbnail}
          onPlaybackStatusUpdate={(status) =>
            handlePlaybackStatusUpdate(status, index)
          }
          onError={(error) =>
            console.error(`Video error at index ${index}:`, error)
          }
        />
        {video.thumbnail && (
          <View style={styles.thumbnailOverlay}>
            <Image
              source={{ uri: video.thumbnail }}
              style={styles.thumbnailImage}
            />
          </View>
        )}
        <Button
          title="Set Thumbnail Image"
          onPress={handleSetThumbnail}
          containerStyle={styles.setThumbnailButtonContainer}
          buttonStyle={styles.setThumbnailButton}
        />
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
    },
    buttonStyle: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
    },
    buttonContainerStyle: {
      flex: 1,
      marginHorizontal: 4,
    },
    buttonTitle: {
      color: theme.colors.black,
      fontSize: 16,
      fontWeight: "600",
    },
    videoList: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    videoWrapper: {
      flex: 1,
      marginBottom: 20,
      marginRight: 16,
      alignItems: "center",
    },
    video: {
      width: VIDEO_WIDTH,
      height: (VIDEO_WIDTH / 3) * 2,
      backgroundColor: "#000",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      paddingHorizontal: 10,
    },
    thumbnailControls: {
      marginTop: 16,
      paddingHorizontal: 8,
    },
    thumbnailLabel: {
      fontSize: 14,
      marginBottom: 8,
      color: theme.colors.grey3,
    },
    slider: {
      width: "100%",
      height: 40,
    },
    playButton: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    hidden: {
      opacity: 0,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
      padding: 10,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    selectButton: {
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      padding: 5,
      borderRadius: 5,
    },
    selectButtonText: {
      color: "#000",
      fontWeight: "bold",
    },
    thumbnailOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 50,
      height: 50,
      zIndex: 1,
    },
    thumbnailImage: {
      width: "100%",
      height: "100%",
      borderRadius: 5,
    },
    setThumbnailButtonContainer: {
      marginTop: 10,
    },
    setThumbnailButton: {
      backgroundColor: theme.colors.primary,
    },
    deleteVideoContainer: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Videos (max {MAX_VIDEO_DURATION} seconds each)
      </Text>

      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

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
          onPress={() => handleVideoSelection(true)}
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
          onPress={() => handleVideoSelection(false)}
          loading={loading}
          disabled={loading}
        />
      </View>

      {videos.length > 0 && (
        <FlatList
          data={videos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.uri}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoList}
        />
      )}
    </View>
  );
};
