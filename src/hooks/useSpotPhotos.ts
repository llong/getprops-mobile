import { useState, useEffect, useRef } from "react";
import { ImagePickerAsset } from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import { mediaService } from "@/services/mediaService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PhotoMetadata, PhotoUploadResult } from "@/types";

// Constants
const TEMP_DIRECTORY = `${FileSystem.cacheDirectory}spotty-temp-media/`;
const THUMBNAIL_CACHE_PREFIX = "@spot_thumbnails:";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useSpotPhotos = () => {
  const [uploading, setUploading] = useState(false);
  const [tempFiles, setTempFiles] = useState<string[]>([]);
  const isCleaningUp = useRef(false);
  const tempFilesRef = useRef<string[]>([]);

  // Cache management functions
  const cacheThumbnailUrl = async (key: string, url: string) => {
    await AsyncStorage.setItem(
      `${THUMBNAIL_CACHE_PREFIX}${key}`,
      JSON.stringify({
        url,
        timestamp: Date.now(),
      })
    );
  };

  const getCachedThumbnailUrl = async (key: string): Promise<string | null> => {
    const cached = await AsyncStorage.getItem(
      `${THUMBNAIL_CACHE_PREFIX}${key}`
    );
    if (!cached) return null;

    const { url, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(`${THUMBNAIL_CACHE_PREFIX}${key}`);
      return null;
    }

    return url;
  };


  // Updated prepareFileInfo to include paths for thumbnails
  const prepareFileInfo = (
    photo: ImagePickerAsset,
    spotId: string,
    userId: string
  ) => {
    const fileExt = photo.uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileId = uuidv4();
    const fileName = `${userId}_${fileId}`;

    return {
      fileExt,
      fileId,
      fileName,
      originalPath: `spots/${spotId}/photos/originals/${fileName}.${fileExt}`,
      thumbnailSmallPath: `spots/${spotId}/photos/thumbnails/${fileName}_240.jpg`,
      thumbnailLargePath: `spots/${spotId}/photos/thumbnails/${fileName}_720.jpg`,
      contentType: `image/${fileExt}`,
    };
  };

  // Updated savePhotoRecord to include thumbnail URLs and metadata
  const savePhotoRecord = async (
    spotId: string,
    userId: string,
    uploadResult: PhotoUploadResult
  ): Promise<void> => {
    try {
      const { data: spotExists } = await supabase
        .from("spots")
        .select("id")
        .eq("id", spotId)
        .maybeSingle();

      if (!spotExists) {
        console.warn(
          `Spot ID ${spotId} does not exist in database yet, skipping record creation`
        );
        return;
      }

      const { error: dbError } = await supabase.from("spot_photos").insert({
        spotId: spotId,
        userId: userId,
        url: uploadResult.originalUrl,
        thumbnailSmallUrl: uploadResult.thumbnailSmallUrl,
        thumbnailLargeUrl: uploadResult.thumbnailLargeUrl,
        width: uploadResult.metadata.width,
        height: uploadResult.metadata.height,
        takenAt: uploadResult.metadata.takenAt,
        location: uploadResult.metadata.location,
        createdAt: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Database insert error:", JSON.stringify(dbError));
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Cache the thumbnail URLs
      await Promise.all([
        cacheThumbnailUrl(
          `${spotId}_${userId}_small`,
          uploadResult.thumbnailSmallUrl
        ),
        cacheThumbnailUrl(
          `${spotId}_${userId}_large`,
          uploadResult.thumbnailLargeUrl
        ),
      ]);
    } catch (err) {
      console.error("Error saving photo record:", err);
      throw err;
    }
  };

  // Main upload function updated to use mediaService
  const uploadPhoto = async (
    photo: ImagePickerAsset,
    spotId: string,
    userId: string,
    onProgress?: (progress: number) => void,
    deferSaving: boolean = false
  ): Promise<PhotoUploadResult | null> => {
    try {
      console.log(`Starting upload for photo: ${photo.fileName ?? "unnamed"}`);

      const result = await mediaService.uploadPhoto(
        { uri: photo.uri, width: photo.width, height: photo.height },
        spotId,
        userId
      );

      if (onProgress) {
        onProgress(100);
      }

      return result;
    } catch (error) {
      console.error("Error uploading photo:", error);
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  };

  // Sync tempFiles state with ref for tracking without re-renders
  useEffect(() => {
    tempFilesRef.current = tempFiles;
  }, [tempFiles]);

  // Create temp directory on mount, but don't automatically clean up
  useEffect(() => {
    const ensureTempDirectory = async () => {
      const dirInfo = await FileSystem.getInfoAsync(TEMP_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(TEMP_DIRECTORY, {
          intermediates: true,
        });
      }
    };

    ensureTempDirectory();
  }, []);

  // Function to clean up temporary files WITHOUT state updates during cleanup
  const cleanupTempFiles = async () => {
    // Prevent concurrent cleanup operations
    if (isCleaningUp.current) {
      console.log("Cleanup already in progress, skipping duplicate call");
      return;
    }

    try {
      isCleaningUp.current = true;
      console.log("Cleaning up temporary media files...");

      // Clean up tracked temporary files using the ref (not state)
      const filesToClean = [...tempFilesRef.current];

      for (const file of filesToClean) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(file);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(file);
            console.log(`Deleted temporary file: ${file}`);
          }
        } catch (err) {
          console.warn(`Failed to delete temp file ${file}:`, err);
        }
      }

      // IMPORTANT: Reset the tracking ref WITHOUT updating state during cleanup
      tempFilesRef.current = [];

      // After cleanup is complete, THEN update state (won't affect current cleanup)
      setTimeout(() => {
        setTempFiles([]);
      }, 100);

      // Also attempt to clean the entire temp directory
      try {
        const dirInfo = await FileSystem.getInfoAsync(TEMP_DIRECTORY);
        if (dirInfo.exists) {
          await FileSystem.deleteAsync(TEMP_DIRECTORY, { idempotent: true });
          await FileSystem.makeDirectoryAsync(TEMP_DIRECTORY, {
            intermediates: true,
          });
          console.log("Refreshed temporary directory");
        }
      } catch (dirErr) {
        console.warn("Error refreshing directory:", dirErr);
      }
    } catch (err) {
      console.warn("Error during file cleanup:", err);
    } finally {
      isCleaningUp.current = false;
    }
  };

  // Create form data for upload
  const createFormData = (
    uri: string,
    fileName: string,
    contentType: string
  ) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: contentType,
    } as any);

    return formData;
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

        console.log("Using auth token for upload");
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
    throw new Error("Upload failed");
  };

  // Upload multiple photos
  const uploadPhotos = async (
    photos: ImagePickerAsset[],
    tempSpotId: string,
    userId: string,
    deferSaving: boolean = false
  ): Promise<PhotoUploadResult[]> => {
    const totalPhotos = photos.length;
    console.log(`Starting upload of ${totalPhotos} photos`);

    if (totalPhotos === 0) {
      throw new Error("No photos to upload");
    }

    const uploadedResults: PhotoUploadResult[] = [];
    let uploadedCount = 0;

    try {
      for (const photo of photos) {
        const result = await uploadPhoto(
          photo,
          tempSpotId,
          userId,
          (progress) => {
            // You can track individual photo progress here if needed
          },
          deferSaving // Pass through the deferSaving flag
        );

        if (result) {
          uploadedResults.push(result);
          uploadedCount++;
        }
      }

      if (uploadedCount === 0) {
        throw new Error("No photos were successfully uploaded");
      }

      return uploadedResults;
    } catch (error) {
      console.error("Error in uploadPhotos:", error);
      throw error;
    }
  };

  // Create a temporary ID for a spot before creating the full record
  const generateTempSpotId = (): string => {
    return uuidv4();
  };

  // Main exports
  return {
    uploadPhoto,
    uploadPhotos,
    generateTempSpotId,
    setUploading,
    uploading,
    cleanupTempFiles,
    savePhotoRecord,
    getCachedThumbnailUrl,
  };
};
