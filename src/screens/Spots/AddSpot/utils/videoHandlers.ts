import { VideoAsset } from "@/types/media";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { showEditor, EditorResult } from "react-native-video-trim";
import { compressVideo, generateThumbnail } from "@/utils/videoProcessing";

// Helper function to select or record a video
const selectOrRecordVideo = async (
  recordVideo: boolean
): Promise<ImagePicker.ImagePickerAsset | null> => {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    quality: 1,
    allowsEditing: false, // Trimming is handled separately
  };

  const result = await (recordVideo
    ? ImagePicker.launchCameraAsync(options)
    : ImagePicker.launchImageLibraryAsync(options));

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }
  return result.assets[0];
};

// Helper function to handle trimming logic
const handlePotentialVideoTrim = async (
  videoAsset: ImagePicker.ImagePickerAsset,
  maxVideoDuration: number // Expects seconds
): Promise<{ outputPath: string; trimmedDurationMs: number } | null> => {
  const durationMs = videoAsset.duration;
  if (durationMs == null) {
    console.error(
      "Video duration is missing, cannot determine if trimming is needed."
    );
    return { outputPath: videoAsset.uri, trimmedDurationMs: 0 };
  }

  let outputPath = videoAsset.uri;
  let finalDurationMs = durationMs;

  if (durationMs > maxVideoDuration * 1000) {
    console.log("Opening trimmer for video:", videoAsset.uri);
    let editResult: EditorResult | undefined;
    try {
      editResult = await showEditor(videoAsset.uri, {
        maxDuration: maxVideoDuration,
        minDuration: 1,
      });
    } catch (trimError) {
      console.error("Error calling showEditor:", trimError);
      return null;
    }

    if (!editResult) {
      console.log("Trimming cancelled or failed (no result object)");
      return null;
    }

    const fileInfo = await FileSystem.getInfoAsync(editResult.outputPath);
    if (!fileInfo.exists || ("size" in fileInfo && fileInfo.size === 0)) {
      console.log(
        "Trimmed file does not exist or is empty:",
        editResult.outputPath
      );
      return null;
    }

    outputPath = editResult.outputPath;
    finalDurationMs = (editResult.duration ?? maxVideoDuration) * 1000;
  }

  return { outputPath, trimmedDurationMs: finalDurationMs };
};

export const handleRemoveVideo = (
  video: VideoAsset,
  setVideos: React.Dispatch<React.SetStateAction<VideoAsset[]>>
) => {
  setVideos((prev) => prev.filter((v) => v.uri !== video.uri));
};

// This function is now simplified as it uses the imported generateThumbnail
export const handleUpdateThumbnail = async (
  video: VideoAsset,
  setVideos: React.Dispatch<React.SetStateAction<VideoAsset[]>>,
  timeMs: number
) => {
  try {
    const newThumbnail = await generateThumbnail(video.uri, timeMs);
    if (newThumbnail) {
      setVideos((prev) =>
        prev.map((v) =>
          v.uri === video.uri ? { ...v, thumbnail: newThumbnail } : v
        )
      );
    }
  } catch (error) {
    console.error("Error updating thumbnail:", error);
  }
};

/**
 * This is the new, consolidated video processing pipeline.
 * It selects, trims, compresses, and generates a thumbnail for a video.
 */
export const processVideoSelection = async (
  recordVideo: boolean,
  maxVideoDuration: number
): Promise<VideoAsset | null> => {
  try {
    // 1. Select or Record Video
    const videoAsset = await selectOrRecordVideo(recordVideo);
    if (!videoAsset) return null;

    if (videoAsset.duration == null) {
      throw new Error("Video duration is missing from the selected asset.");
    }

    // 2. Handle Potential Trimming
    const trimResult = await handlePotentialVideoTrim(
      videoAsset,
      maxVideoDuration
    );
    if (!trimResult) return null;

    const { outputPath: trimmedUri, trimmedDurationMs } = trimResult;

    // 3. Compress the video (trimmed or original)
    console.log(`Compressing video: ${trimmedUri}`);
    const compressedUri = await compressVideo(trimmedUri);
    console.log(`Compressed video URI: ${compressedUri}`);

    // 4. Generate Thumbnail from the *compressed* video
    const thumbnail = await generateThumbnail(compressedUri);
    if (!thumbnail) {
      throw new Error("Could not generate thumbnail for the compressed video.");
    }

    // 5. Get final file info for the compressed video
    const finalFileInfo = await FileSystem.getInfoAsync(compressedUri);
    const fileSize =
      finalFileInfo.exists && "size" in finalFileInfo ? finalFileInfo.size : 0;

    if (fileSize === 0) {
      throw new Error("The final compressed video file is empty.");
    }

    // 6. Return the complete, processed VideoAsset
    return {
      uri: compressedUri,
      width: videoAsset.width ?? 0,
      height: videoAsset.height ?? 0,
      duration: trimmedDurationMs,
      filename: compressedUri.split("/").pop() ?? "video.mp4",
      mediaType: "video",
      creationTime: Date.now(),
      modificationTime: Date.now(),
      assetId: videoAsset.assetId ?? compressedUri.split("/").pop() ?? "",
      fileSize: fileSize,
      localUri: compressedUri,
      thumbnail,
    };
  } catch (error) {
    console.error("Full video processing pipeline error:", error);
    // Re-throw to be caught by the calling component
    throw error;
  }
};
