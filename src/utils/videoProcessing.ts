import * as FileSystem from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as ImageManipulator from "expo-image-manipulator";
import { Video } from "react-native-compressor";

/**
 * Compresses a video using react-native-compressor.
 * @param videoUri The URI of the video to compress.
 * @returns The URI of the compressed video.
 * @throws If compression fails or results in an invalid file.
 */
export const compressVideo = async (videoUri: string): Promise<string> => {
  console.log(`[compressVideo] Starting compression for: ${videoUri}`);
  try {
    const result = await Video.compress(
      videoUri,
      {
        compressionMethod: "manual",
        maxSize: 1280,
        bitrate: 2 * 1024 * 1024, // Increased to 2 Mbps for better quality
      },
      (progress) => {
        console.log(
          `[compressVideo] Compression progress: ${Math.round(progress * 100)}%`
        );
      }
    );

    const fileInfo = await FileSystem.getInfoAsync(result, { size: true });
    if (!fileInfo.exists || fileInfo.size === 0) {
      throw new Error("Compression resulted in an invalid or empty file.");
    }

    console.log(
      `[compressVideo] Compression successful. Output size: ${(
        fileInfo.size /
        1024 /
        1024
      ).toFixed(2)} MB`
    );
    return result;
  } catch (error) {
    console.error("[compressVideo] Error:", error);
    throw new Error(
      `Video compression failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Generates a thumbnail for a video at a specific time.
 * @param videoUri The URI of the video.
 * @param time The time in milliseconds to generate the thumbnail from.
 * @returns The URI of the generated thumbnail.
 * @throws If thumbnail generation fails.
 */
export const generateThumbnail = async (
  videoUri: string,
  time: number = 0
): Promise<string> => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time });
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 480 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (e) {
    console.warn("[generateThumbnail] Error:", e);
    throw new Error("Failed to generate video thumbnail.");
  }
};
