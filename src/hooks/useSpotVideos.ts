import { useState } from "react";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./useAuth";
import { VideoAsset } from "@/types/media";

export type VideoUploadResult = {
  url: string;
  thumbnailUrl: string;
  duration: number | undefined;
  width: number;
  height: number;
  fileSize: number | undefined;
  created_at: string;
};

export const useSpotVideos = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const uploadVideo = async (
    video: VideoAsset,
    spotId: string,
    onProgress?: (progress: number) => void
  ): Promise<VideoUploadResult> => {
    if (!user) throw new Error("Must be authenticated to upload videos");
    if (!video.thumbnail)
      throw new Error("Video asset is missing a thumbnail.");

    try {
      const fileId = uuidv4();
      const fileName = `${user.id}_${fileId}`;
      const fileExtension = video.uri.split(".").pop()?.toLowerCase() ?? "mp4";

      const videoPath = `spots/${spotId}/videos/originals/${fileName}.${fileExtension}`;
      const thumbnailPath = `spots/${spotId}/videos/thumbnails/${fileName}.jpg`;

      // --- Upload Thumbnail (uses FormData, which is fine for images) ---
      onProgress?.(10);
      const thumbnailFormData = new FormData();
      thumbnailFormData.append("file", {
        uri: video.thumbnail,
        name: `${fileName}.jpg`,
        type: "image/jpeg",
      } as any);

      const thumbnailUrl = await performStorageUpload(
        "spot-media",
        thumbnailPath,
        thumbnailFormData
      );
      onProgress?.(30);

      // --- Upload Video (uses blob directly) ---
      console.log(`[uploadVideo] Uploading processed video: ${video.uri}`);
      const videoInfo = await FileSystem.getInfoAsync(video.uri, {
        size: true,
      });
      if (!videoInfo.exists || videoInfo.size === 0) {
        throw new Error("The final video file to upload is invalid or empty.");
      }

      const response = await fetch(video.uri);
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Cannot upload an empty video blob.");
      }

      const contentType = `video/${
        fileExtension === "mov" ? "quicktime" : fileExtension
      }`;

      // Pass blob directly to performStorageUpload
      const videoUrl = await performStorageUpload(
        "spot-media",
        videoPath,
        blob, // Pass blob instead of FormData
        contentType // Pass contentType
      );
      onProgress?.(90);

      // --- Save Record to Database ---
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
      onProgress?.(100);

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
      console.error("[uploadVideo] Error:", error);
      throw error;
    }
  };

  const uploadVideos = async (
    videos: VideoAsset[],
    spotId: string,
    concurrentUploads: number = 2
  ): Promise<VideoUploadResult[]> => {
    if (!videos.length) return [];

    try {
      setUploading(true);
      const results: VideoUploadResult[] = [];
      const chunks = [];

      for (let i = 0; i < videos.length; i += concurrentUploads) {
        chunks.push(videos.slice(i, i + concurrentUploads));
      }

      for (const chunk of chunks) {
        const chunkPromises = chunk.map((video) => {
          const videoId = video.uri;
          return uploadVideo(video, spotId, (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [videoId]: progress,
            }));
          });
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }

      return results;
    } catch (error) {
      console.error("Error in batch video upload:", error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Refactored to handle either FormData or a Blob
  const performStorageUpload = async (
    bucketName: string,
    filePath: string,
    body: FormData | Blob,
    contentType?: string, // Make contentType optional
    maxRetries = 3
  ): Promise<string> => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;

    if (!accessToken) {
      throw new Error("No valid session found - upload will fail");
    }

    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${accessToken}`,
      "x-upsert": "true",
    };

    // If body is a Blob, set the Content-Type header
    if (contentType && body instanceof Blob) {
      headers["Content-Type"] = contentType;
    }

    for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
      try {
        if (retryCount > 0) {
          console.log(
            `Retrying upload for ${filePath}, attempt ${retryCount + 1}...`
          );
          await new Promise((r) => setTimeout(r, 2000 * retryCount));
        }

        const uploadResponse = await fetch(
          `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`,
          {
            method: "POST",
            headers,
            body,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(
            `Upload failed: ${uploadResponse.status} - ${errorText}`
          );
        }

        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error(`Failed to get public URL for ${filePath}`);
        }

        return urlData.publicUrl;
      } catch (err) {
        console.warn(
          `Error on attempt ${retryCount + 1} for ${filePath}:`,
          err
        );
        if (retryCount === maxRetries - 1) {
          throw new Error(
            `Failed after ${maxRetries} upload attempts for ${filePath}`
          );
        }
      }
    }
    throw new Error("Upload failed after all retries.");
  };

  return {
    uploadVideos,
    uploading,
    setUploading,
    uploadProgress,
  };
};
