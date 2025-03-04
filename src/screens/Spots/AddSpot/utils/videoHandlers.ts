import { VideoAsset } from "@/types/media";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { showEditor } from "react-native-video-trim";

export const handleRemoveVideo = (
  video: VideoAsset,
  setVideos: React.Dispatch<React.SetStateAction<VideoAsset[]>>
) => {
  setVideos((prev) => prev.filter((v) => v.uri !== video.uri));
};

export const handleUpdateThumbnail = async (
  video: VideoAsset,
  setVideos: React.Dispatch<React.SetStateAction<VideoAsset[]>>,
  generateThumbnail: (
    uri: string,
    time?: number
  ) => Promise<string | undefined>,
  time?: number
) => {
  try {
    const newThumbnail = await generateThumbnail(video.uri, time);
    if (newThumbnail) {
      setVideos((prev) =>
        prev.map((v) =>
          v.uri === video.uri ? { ...v, thumbnailUri: newThumbnail } : v
        )
      );
    }
  } catch (error) {
    console.error("Error updating thumbnail:", error);
  }
};

export const processVideoSelection = async (
  recordVideo: boolean,
  maxVideoDuration: number,
  generateThumbnail: (uri: string) => Promise<string | undefined>
) => {
  try {
    const result = await (recordVideo
      ? ImagePicker.launchCameraAsync({
          mediaTypes: "videos",
          quality: 0.8,
          videoMaxDuration: maxVideoDuration,
          allowsEditing: false,
        })
      : ImagePicker.launchImageLibraryAsync({
          mediaTypes: "videos",
          quality: 0.8,
          allowsEditing: false,
        }));

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    let videoAsset = result.assets[0];
    console.log("Selected video duration:", videoAsset.duration);

    let outputPath = videoAsset.uri; // Default to original URI
    let trimmedDuration = videoAsset.duration ?? maxVideoDuration; // Default duration

    // Check if video needs trimming
    if ((videoAsset.duration ?? 0) > maxVideoDuration) {
      console.log("Opening trimmer for video:", videoAsset.uri);
      const editResult = await showEditor(videoAsset.uri, {
        maxDuration: maxVideoDuration,
        minDuration: 1,
      });

      if (!editResult) {
        console.log("Trimming cancelled or failed");
        return null;
      }

      console.log("Got trimming result:", editResult);

      if (!editResult.outputPath) {
        console.log("No output path in trim result");
        return null;
      }

      // Check if the output file exists
      const fileExists = await FileSystem.getInfoAsync(editResult.outputPath);
      if (!fileExists.exists) {
        console.log("Trimmed file does not exist:", editResult.outputPath);
        return null;
      }

      outputPath = editResult.outputPath; // Use trimmed path
      trimmedDuration = editResult.duration; // Use trimmed duration
    }

    console.log("Generating thumbnail");
    const thumbnail = await generateThumbnail(outputPath); // Use outputPath
    if (!thumbnail) {
      throw new Error("Could not generate thumbnail");
    }

    const fileInfo = await FileSystem.getInfoAsync(outputPath); // Use outputPath
    return {
      uri: outputPath, // Always return the correct URI (trimmed or original)
      width: videoAsset.width ?? 0,
      height: videoAsset.height ?? 0,
      duration: trimmedDuration, // Return correct duration
      type: "video" as const,
      thumbnail,
      assetId: outputPath.split("/").pop() ?? "", // Use outputPath for asset ID
      fileName: outputPath.split("/").pop() ?? "", // Use outputPath for filename
      fileSize: fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0,
    };
  } catch (error) {
    console.error("Video selection error:", error);
    throw error;
  }
};
