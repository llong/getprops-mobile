import { useState, useCallback } from "react";
import * as VideoThumbnails from "expo-video-thumbnails";

export const useVideoProcessing = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Accept video duration (in ms) as an argument
  const generateThumbnail = useCallback(
    async (
      videoUri: string,
      videoDurationMs?: number, // Duration in milliseconds
      time?: number // Optional specific time in seconds
    ): Promise<string | undefined> => {
      try {
        const properUri = videoUri.startsWith("file://")
          ? videoUri
          : `file://${videoUri}`;

        let timeMs: number;
        if (time != null) {
          // If specific time is provided (likely seconds from slider), convert and round
          timeMs = Math.round(time * 1000);
        } else {
          // If no specific time, generate thumbnail near the start (e.g., 0ms or a small offset)
          // Avoid random time for default thumbnail to prevent errors if duration is unknown
          timeMs = 0;
        }

        // Ensure timeMs is within valid range if duration is known
        if (videoDurationMs != null) {
          timeMs = Math.max(0, Math.min(timeMs, videoDurationMs));
        } else {
          timeMs = Math.max(0, timeMs); // Ensure non-negative
        }

        const { uri } = await VideoThumbnails.getThumbnailAsync(properUri, {
          time: timeMs, // Pass integer milliseconds
          quality: 0.7,
        });

        return uri;
      } catch (e) {
        console.warn("Error generating thumbnail:", e);
        return undefined;
      }
    },
    [] // Removed maxVideoDuration from dependencies
  );

  return {
    error,
    setError,
    loading,
    setLoading,
    generateThumbnail,
  };
};
