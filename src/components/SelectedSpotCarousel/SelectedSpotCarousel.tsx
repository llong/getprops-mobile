import React, { useCallback, useRef } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text as RNText,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Text, Icon } from "@rneui/themed";
import { useSpotImages } from "@/hooks/useSpotImages";

interface SpotImage {
  id: string;
  url: string;
}

interface SpotImages {
  [key: string]: string[];
}

type SelectedSpotCarouselProps = {
  spotId: string;
  photos: SpotImage[];
  isLoading?: boolean;
};

const { width } = Dimensions.get("window");
const CAROUSEL_HEIGHT = 200;

interface CarouselItemProps {
  url: string;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ url }) => {
  if (!url) {
    return (
      <View style={[styles.image, styles.errorContainer]}>
        <Icon
          name="image-off"
          type="material-community"
          size={30}
          color="#999"
        />
        <RNText style={styles.errorText}>Image unavailable</RNText>
      </View>
    );
  }

  return (
    <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
  );
};

export const SelectedSpotCarousel: React.FC<SelectedSpotCarouselProps> =
  React.memo(({ spotId, photos, isLoading = false }) => {
    const carouselRef = useRef(null);

    // Move hooks to top level - use empty string as fallback for spotId
    const {
      images,
      loading: imagesLoading,
      error,
    } = useSpotImages(spotId || "");

    // Define renderItem at the top level to avoid conditional hook call
    const renderItem = useCallback(({ item }: { item: SpotImage }) => {
      if (!item?.url) {
        return (
          <View style={[styles.image, styles.errorContainer]}>
            <Icon
              name="image-off"
              type="material-community"
              size={30}
              color="#999"
            />
            <RNText style={styles.errorText}>Image unavailable</RNText>
          </View>
        );
      }

      return <CarouselItem url={item.url} />;
    }, []);

    // Safety check for valid spotId
    if (!spotId) {
      return (
        <View style={styles.container}>
          <View style={styles.placeholderContainer}>
            <Icon
              name="image-off"
              type="material-community"
              size={40}
              color="#999"
            />
            <Text style={styles.placeholderText}>No spot selected</Text>
          </View>
        </View>
      );
    }

    // Get images and do the rest of the processing
    const spotImages = images[spotId] || [];

    // Combine both sources of images for fallback support
    const combinedImages =
      photos && photos.length > 0
        ? photos
        : spotImages.map((url: string, index: number) => ({
            id: `image-${index}`,
            url,
          }));

    // Render loading state
    if (isLoading || imagesLoading) {
      return (
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading images...</Text>
          </View>
        </View>
      );
    }

    // Render error state
    if (error) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Icon
              name="alert-circle"
              type="material-community"
              size={40}
              color="#f44336"
            />
            <Text style={styles.errorText}>Failed to load images</Text>
          </View>
        </View>
      );
    }

    // Render empty state
    if (!combinedImages || combinedImages.length === 0) {
      return (
        <View style={styles.container}>
          <View style={styles.placeholderContainer}>
            <Icon
              name="image-off"
              type="material-community"
              size={40}
              color="#999"
            />
            <Text style={styles.placeholderText}>No images available</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Carousel
          ref={carouselRef}
          loop
          width={width}
          height={CAROUSEL_HEIGHT}
          autoPlay={combinedImages.length > 1}
          data={combinedImages}
          scrollAnimationDuration={1000}
          renderItem={renderItem}
          panGestureHandlerProps={{
            activeOffsetX: [-10, 10],
          }}
        />
      </View>
    );
  });

const styles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  errorText: {
    marginTop: 5,
    color: "#555",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    marginTop: 10,
    color: "#555",
  },
});
