import { useState, useCallback } from "react";
import * as VideoThumbnails from "expo-video-thumbnails";

export const useVideoProcessing = (maxVideoDuration: number) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateThumbnail = useCallback(
    async (videoUri: string, time?: number): Promise<string | undefined> => {
      try {
        const properUri = videoUri.startsWith("file://")
          ? videoUri
          : `file://${videoUri}`;
        const randomTime = time ?? Math.random() * maxVideoDuration;

        const { uri } = await VideoThumbnails.getThumbnailAsync(properUri, {
          time: randomTime * 1000,
          quality: 0.7,
        });

        return uri;
      } catch (e) {
        console.warn("Error generating thumbnail:", e);
        return undefined;
      }
    },
    [maxVideoDuration]
  );

  return {
    error,
    setError,
    loading,
    setLoading,
    generateThumbnail,
  };
};
