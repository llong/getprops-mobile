import { useRef, useCallback, useEffect } from "react";
import { Video } from "expo-av"; // Import Video from expo-av

export const useVideoRefs = () => {
  const videoRefs = useRef<{ [key: number]: Video | null }>({});

  const setVideoRef = useCallback((index: number, ref: Video | null) => {
    videoRefs.current[index] = ref;
  }, []);

  const getVideoRef = useCallback(
    (index: number) => videoRefs.current[index],
    []
  );

  // Cleanup function to pause players when component unmounts
  const cleanupVideoRefs = useCallback(async () => {
    try {
      await Promise.all(
        Object.values(videoRefs.current).map(async (player) => {
          if (player) {
            try {
              // Use pauseAsync for expo-av
              await player.pauseAsync();
            } catch (error) {
              console.warn(
                "[VideoRefs] Error cleaning up video player:",
                error
              );
            }
          }
        })
      );
      videoRefs.current = {}; // Clear refs
    } catch (error) {
      console.warn("[VideoRefs] Error during cleanup loop:", error);
    }
  }, []);

  // Effect to run cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupVideoRefs();
    };
  }, [cleanupVideoRefs]);

  return { setVideoRef, getVideoRef, cleanupVideoRefs };
};
