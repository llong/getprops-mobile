import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { View, StyleSheet, ScrollView, Dimensions, Share } from "react-native";
import { Divider } from "@rneui/themed";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";
import { useSpots } from "@hooks/useSpots";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import {
  MediaCarousel,
  SpotHeader,
  SpotAttributes,
  SpotCreatorInfo,
  SpotActions,
  SpotNotFound,
} from "@/components/SpotDetails";

// Define windowWidth outside the component so it can be used in styles
const windowWidth = Dimensions.get("window").width;

type SpotDetailsRouteProp = RouteProp<RootStackParamList, "SpotDetails">;

interface MediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
  thumbnailUrl?: string;
}

interface SpotPhoto {
  id: string;
  url: string;
}

interface SpotVideo {
  id: string;
  url: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
}

// Extend the useSpots hook return type to include fetchSpotMedia
interface UseSpotHookExtended {
  spot: any;
  loading: boolean;
  upvoteSpot: (id: string) => Promise<any>;
  downvoteSpot: (id: string) => Promise<any>;
  fetchSpotMedia: (spotId: string) => Promise<{
    photos: SpotPhoto[];
    videos: SpotVideo[];
  }>;
}

export const SpotDetailsScreen = memo(() => {
  const route = useRoute<SpotDetailsRouteProp>();
  const navigation = useNavigation();

  // Get spot ID from route params
  const spotId = route.params?.spotId;
  const passedSpotRef = useRef(route.params?.spot);

  console.log("[SpotDetailsScreen] Received spotId:", spotId);
  console.log("[SpotDetailsScreen] Has passed spot:", !!passedSpotRef.current);

  // State for media and loading
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Always use useSpots to ensure we have the latest data, but preferentially use passed spot data
  const {
    spot: fetchedSpot,
    loading: spotLoading,
    upvoteSpot,
    downvoteSpot,
    fetchSpotMedia,
  } = useSpots(spotId);

  // Use passed spot if available, otherwise use fetched spot
  // Important: passedSpot might be there but incomplete, so we merge with fetchedSpot when both are available
  const spot = useMemo(() => {
    if (fetchedSpot && passedSpotRef.current) {
      // Prefer database data but fill in any missing fields from passed spot
      return { ...passedSpotRef.current, ...fetchedSpot };
    }
    return passedSpotRef.current || fetchedSpot;
  }, [fetchedSpot, passedSpotRef]);

  const loading = spotLoading && !passedSpotRef.current;

  useEffect(() => {
    if (spot) {
      console.log("[SpotDetailsScreen] Using spot:", spot.name);
    } else if (spotLoading) {
      console.log("[SpotDetailsScreen] Still loading spot data...");
    } else {
      console.log("[SpotDetailsScreen] No spot data available");
    }
  }, [spot, spotLoading]);

  // Memoize the loadMedia function to prevent recreating it on each render
  const loadMedia = useCallback(async () => {
    if (!spotId) {
      console.error(
        "[SpotDetailsScreen] No spot ID provided for media loading"
      );
      return;
    }

    setIsMediaLoading(true);
    try {
      // Check if we have media in the passed spot data first
      const passedSpot = passedSpotRef.current;
      if (passedSpot?.photos?.length > 0 || passedSpot?.videos?.length > 0) {
        console.log("[SpotDetailsScreen] Using media from passed spot data");

        const mediaItems: MediaItem[] = [
          ...(passedSpot.photos || []).map(
            (photoUrl: string, index: number) => ({
              id: `photo-${index}`,
              url: photoUrl,
              type: "photo" as const,
            })
          ),
          ...(passedSpot.videos || []).map(
            (videoUrl: string, index: number) => ({
              id: `video-${index}`,
              url: videoUrl,
              type: "video" as const,
              thumbnailUrl: undefined,
            })
          ),
        ];

        setMedia(mediaItems);
      } else {
        // Otherwise fetch media from the database
        console.log(
          "[SpotDetailsScreen] Fetching media from database for ID:",
          spotId
        );
        const { photos, videos } = await fetchSpotMedia(spotId);

        console.log("[SpotDetailsScreen] Fetched photos:", photos?.length || 0);
        console.log("[SpotDetailsScreen] Fetched videos:", videos?.length || 0);

        if (!photos && !videos) {
          console.warn("[SpotDetailsScreen] No media found for spot");
          setMedia([]);
          return;
        }

        const mediaItems: MediaItem[] = [
          ...(photos ?? []).map((photo: SpotPhoto) => ({
            id: photo.id ?? `photo-${Math.random()}`,
            url: photo.url,
            type: "photo" as const,
          })),
          ...(videos ?? []).map((video: SpotVideo) => ({
            id: video.id ?? `video-${Math.random()}`,
            url: video.url,
            type: "video" as const,
            thumbnailUrl: video.thumbnailUrl ?? video.thumbnail_url,
          })),
        ];

        console.log(
          "[SpotDetailsScreen] Created media items:",
          mediaItems.length
        );
        setMedia(mediaItems);
      }
    } catch (error) {
      console.error("[SpotDetailsScreen] Error loading spot media:", error);
      setMedia([]);
    } finally {
      setIsMediaLoading(false);
    }
  }, [spotId, fetchSpotMedia]);

  // Use the memoized function in useEffect
  useEffect(() => {
    console.log("[SpotDetailsScreen] Media loading effect triggered");
    if (spotId) {
      loadMedia();
    }

    return () => {
      console.log("[SpotDetailsScreen] Media loading effect cleanup");
    };
  }, [loadMedia]);

  // Memoized handlers to prevent recreating on each render
  const handleNavigate = useCallback(() => {
    // Navigation logic here
    console.log("Navigate to spot location");
  }, []);

  const handleUpvote = useCallback(() => {
    if (spotId) {
      upvoteSpot(spotId);
    }
  }, [spotId, upvoteSpot]);

  const handleDownvote = useCallback(() => {
    if (spotId) {
      downvoteSpot(spotId);
    }
  }, [spotId, downvoteSpot]);

  const handleShare = useCallback(() => {
    if (spot) {
      Share.share({
        message: `Check out this skate spot: ${spot.name}`,
        url: `https://yourapp.com/spots/${spotId}`,
      });
    }
  }, [spot, spotId]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Main render method with simplified logic
  if (loading) {
    return (
      <View style={styles.centeredContent}>
        <LoadingSpinner size="large" text="Loading spot details..." />
      </View>
    );
  }

  if (!spot) {
    return (
      <SpotNotFound
        spotId={spotId}
        routeParams={route.params}
        onGoBack={handleGoBack}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <MediaCarousel
        media={media}
        isLoading={isMediaLoading}
        activeSlide={activeSlide}
        onSlideChange={setActiveSlide}
      />

      <SpotHeader
        name={spot.name}
        address={spot.address}
        city={spot.city}
        country={spot.country}
      />

      <Divider style={{ marginVertical: 15 }} />

      <SpotAttributes
        spotType={spot.spotType}
        difficulty={spot.difficulty}
        kickoutRisk={spot.kickoutRisk}
        isLit={spot.isLit}
        description={spot.description}
      />

      <SpotCreatorInfo
        createdAt={spot.createdAt}
        createdBy={spot.createdBy}
        username={spot.username}
      />

      <SpotActions
        onNavigate={handleNavigate}
        onUpvote={handleUpvote}
        onDownvote={handleDownvote}
        onShare={handleShare}
        upvoteCount={spot.upvotes}
        downvoteCount={spot.downvotes}
      />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
