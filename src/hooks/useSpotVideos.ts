import { useState } from "react";
import { supabase } from "@/utils/supabase";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as ImageManipulator from "expo-image-manipulator";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./useAuth";
import { VideoAsset } from "@/types/media";

export const useSpotVideos = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const generateThumbnail = async (videoUri: string) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 0,
      });
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      return manipResult.base64;
    } catch (e) {
      console.warn("Error generating thumbnail:", e);
      return null;
    }
  };

  const uploadVideo = async (video: VideoAsset, spotId: string) => {
    if (!user) throw new Error("Must be authenticated to upload videos");
    if (video.duration && video.duration > 60)
      throw new Error("Video must be 60 seconds or less");

    try {
      setUploading(true);

      const fileName = `${uuidv4()}.mp4`;
      const filePath = `${spotId}/${fileName}`;
      const thumbnailPath = `${spotId}/${fileName}-thumb.jpg`;

      // Generate and upload thumbnail
      const thumbnail = await generateThumbnail(video.uri);
      if (!thumbnail) throw new Error("Failed to generate video thumbnail");

      // Create form data for thumbnail upload
      const thumbnailFormData = new FormData();
      thumbnailFormData.append("file", {
        uri: `data:image/jpeg;base64,${thumbnail}`,
        name: `${fileName}-thumb.jpg`,
        type: "image/jpeg",
      } as any);

      // Upload thumbnail using performStorageUpload
      const thumbnailUrl = await performStorageUpload(
        "spot-media",
        `thumbnails/${thumbnailPath}`,
        thumbnailFormData
      );

      // Create form data for video upload
      const videoFormData = new FormData();
      const response = await fetch(video.uri);
      const blob = await response.blob();
      videoFormData.append("file", blob as any);

      // Upload video using performStorageUpload
      const videoUrl = await performStorageUpload(
        "spot-media",
        `videos/${filePath}`,
        videoFormData
      );

      // Save to spot_videos table with new fields
      const { error: dbError } = await supabase.from("spot_videos").insert({
        spot_id: spotId,
        user_id: user.id,
        url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration: Math.round(video.duration ?? 0),
        file_size: video.fileSize,
        width: video.width,
        height: video.height,
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      return {
        url: videoUrl,
        thumbnailUrl,
        duration: video.duration,
        width: video.width,
        height: video.height,
        fileSize: video.fileSize,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Perform the storage upload with retry logic
  const performStorageUpload = async (
    bucketName: string,
    filePath: string,
    formData: FormData,
    maxRetries = 3
  ): Promise<string> => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";

    // Get the current session directly from Supabase
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;

    if (!accessToken) {
      console.error("No valid session found - upload will likely fail");
    }

    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount}...`);
          await new Promise((r) => setTimeout(r, 2000 * retryCount)); // Exponential backoff
        }

        console.log("Using auth token for video upload");
        const uploadResponse = await fetch(
          `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "x-upsert": "true",
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.warn(
            `Upload attempt ${retryCount + 1} failed: ${
              uploadResponse.status
            } - ${errorText}`
          );
          retryCount++;
          continue;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error(`Failed to get public URL`);
        }

        return urlData.publicUrl;
      } catch (err) {
        console.warn(`Error on attempt ${retryCount + 1}:`, err);
        retryCount++;

        if (retryCount >= maxRetries) {
          throw new Error(`Failed after ${maxRetries} upload attempts`);
        }
      }
    }

    // This should never be reached due to the throw above, but TypeScript needs it
    throw new Error("Upload failed after all retries");
  };

  return {
    uploadVideo,
    uploading,
    setUploading,
  };
};
