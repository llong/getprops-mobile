import React, { useCallback, memo } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { Text, Icon, useTheme } from "@rneui/themed";
import Carousel from "react-native-reanimated-carousel";
import { Video, ResizeMode } from "expo-av";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";

// Define windowWidth outside the component so it can be used in styles
const windowWidth = Dimensions.get("window").width;

interface MediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
  thumbnailUrl?: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  isLoading: boolean;
  activeSlide: number;
  onSlideChange: (index: number) => void;
}

export const MediaCarousel = memo(
  ({ media, isLoading, activeSlide, onSlideChange }: MediaCarouselProps) => {
    const { theme } = useTheme();

    const renderMediaItem = useCallback(
      ({ item }: { item: MediaItem; index: number }) => {
        try {
          if (!item?.url) {
            console.log("Invalid media item:", item);
            return (
              <View style={styles.mediaContainer}>
                <Icon
                  name="image-off"
                  type="material-community"
                  size={40}
                  color={theme.colors.grey3}
                />
                <Text style={{ color: theme.colors.grey3, marginTop: 5 }}>
                  Media unavailable
                </Text>
              </View>
            );
          }

          if (item.type === "photo") {
            return (
              <View style={styles.mediaContainer}>
                <Image
                  source={{ uri: item.url }}
                  style={styles.mediaItem}
                  resizeMode="cover"
                />
              </View>
            );
          } else {
            // Video
            return (
              <View style={styles.mediaContainer}>
                <Video
                  source={{ uri: item.url }}
                  style={styles.mediaItem}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  posterSource={{ uri: item.thumbnailUrl }}
                  usePoster={Boolean(item.thumbnailUrl)}
                />
              </View>
            );
          }
        } catch (error) {
          console.error("Error rendering media item:", error, item);
          return (
            <View style={styles.mediaContainer}>
              <Text>Error displaying media</Text>
            </View>
          );
        }
      },
      [theme.colors.grey3]
    );

    if (isLoading) {
      return (
        <View style={styles.mediaLoading}>
          <LoadingSpinner size="large" text="Loading media..." />
        </View>
      );
    }

    if (media.length > 0) {
      return (
        <View style={styles.carouselContainer}>
          <Carousel
            width={windowWidth}
            height={300}
            data={media}
            renderItem={renderMediaItem}
            loop={false}
            mode="parallax"
            snapEnabled
            onSnapToItem={onSlideChange}
            defaultIndex={0}
            enabled={true}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
          />

          {media.length > 1 && (
            <View style={styles.paginationContainer}>
              {media.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor:
                        index === activeSlide
                          ? theme.colors.primary
                          : theme.colors.grey4,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.noMediaContainer}>
        <Icon
          name="image-off"
          type="material-community"
          size={60}
          color={theme.colors.grey3}
        />
        <Text style={styles.noMediaText}>No photos or videos available</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  carouselContainer: {
    position: "relative",
    height: 300,
    width: "100%",
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaItem: {
    width: "100%",
    height: "100%",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  mediaLoading: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noMediaContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noMediaText: {
    marginTop: 10,
    color: "#888",
  },
});
