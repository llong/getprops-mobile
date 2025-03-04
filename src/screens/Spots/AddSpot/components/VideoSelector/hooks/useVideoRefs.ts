import { useRef, useEffect } from "react";
import { Video } from "expo-av";

export const useVideoRefs = () => {
  const videoRefs = useRef<{ [key: number]: Video | null }>({});

  const setVideoRef = (index: number, ref: Video | null) => {
    videoRefs.current[index] = ref;
  };

  const getVideoRef = (index: number) => videoRefs.current[index];

  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach(async (ref) => {
        if (ref) {
          try {
            await ref.unloadAsync();
          } catch (error) {
            // Handle error silently
          }
        }
      });
    };
  }, []);

  return { setVideoRef, getVideoRef };
};
