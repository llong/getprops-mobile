import { useState, useEffect, useRef } from "react";
import { ImagePickerAsset } from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import * as ImageManipulator from "expo-image-manipulator";

// Create a temporary directory for our optimized images
const TEMP_DIRECTORY = `${FileSystem.cacheDirectory}spotty-temp-media/`;

export const useSpotPhotos = () => {
  const [uploading, setUploading] = useState(false);
  const [tempFiles, setTempFiles] = useState<string[]>([]);
  const isCleaningUp = useRef(false);
  const tempFilesRef = useRef<string[]>([]);

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

  // Export savePhotoRecord for use in other files
  const savePhotoRecord = async (
    spotId: string,
    userId: string,
    publicUrl: string
  ): Promise<void> => {
    try {
      console.log(`Saving photo record for URL: ${publicUrl}`);

      // Check if spot exists before attempting to insert
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
        spotId,
        user_id: userId,
        url: publicUrl,
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Database insert error:", JSON.stringify(dbError));
        throw new Error(`Database error: ${dbError.message}`);
      }
    } catch (err) {
      console.error("Error saving photo record:", err);
      throw err;
    }
  };

  // Optimize image for upload - compress and resize while maintaining quality
  const optimizeImage = async (uri: string): Promise<string> => {
    try {
      // Determine optimal dimensions for full-screen viewing
      // We'll resize to 1280px width max (good balance for mobile devices) while maintaining aspect ratio
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1280 } }],
        {
          compress: 0.7, // 70% quality offers better compression while maintaining good quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Log the file size reduction
      const originalInfo = await FileSystem.getInfoAsync(uri);
      const optimizedInfo = await FileSystem.getInfoAsync(result.uri);

      if (originalInfo.exists && optimizedInfo.exists) {
        const originalSize = originalInfo.size / (1024 * 1024); // Convert to MB
        const optimizedSize = optimizedInfo.size / (1024 * 1024); // Convert to MB
        console.log(
          `Image optimized from ${originalSize.toFixed(
            2
          )}MB to ${optimizedSize.toFixed(2)}MB`
        );
        console.log(
          `Compression ratio: ${((optimizedSize / originalSize) * 100).toFixed(
            1
          )}%`
        );
      }

      return result.uri;
    } catch (error) {
      console.warn("Image optimization failed, using original:", error);
      return uri;
    }
  };

  // Prepare file information for upload
  const prepareFileInfo = (photo: ImagePickerAsset, spotId: string) => {
    const fileExt = photo.uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${spotId}/${fileName}`;

    return {
      fileExt,
      fileName,
      filePath,
      contentType: `image/${fileExt}`,
    };
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

  // Main upload function with reduced complexity
  const uploadPhoto = async (
    photo: ImagePickerAsset,
    spotId: string,
    userId: string,
    onProgress?: (progress: number) => void,
    deferSaving: boolean = false
  ): Promise<string | null> => {
    try {
      console.log(`Starting upload for photo: ${photo.fileName ?? "unnamed"}`);

      // Step 1: Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(photo.uri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }
      console.log(`File size before optimization: ${fileInfo.size} bytes`);

      // Step 2: Optimize the image
      const optimizedUri = await optimizeImage(photo.uri);

      // Step 3: Prepare file information
      const { fileName, filePath, contentType } = prepareFileInfo(
        photo,
        spotId
      );

      // Step 4: Create form data
      const formData = createFormData(optimizedUri, fileName, contentType);

      // Step 5: Perform the upload
      console.log(`Uploading to spot-media/${filePath}`);
      const publicUrl = await performStorageUpload(
        "spot-media",
        filePath,
        formData
      );

      // Step 6: Save record to database (unless deferred)
      if (!deferSaving) {
        try {
          await savePhotoRecord(spotId, userId, publicUrl);
          console.log("Photo record saved successfully");
        } catch (saveError) {
          console.warn(
            "Could not save photo record, but upload succeeded:",
            saveError
          );
          // Don't fail the whole upload if just the database record fails
        }
      }

      if (onProgress) {
        onProgress(100);
      }

      return publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);

      // Better error message for bucket issues
      if (error instanceof Error && error.message.includes("bucket")) {
        Toast.show({
          type: "error",
          text1: "Storage Error",
          text2:
            "Please run the Supabase migration to create the spot-media bucket",
        });
      } else if (
        error instanceof Error &&
        error.message.includes("413") // HTTP 413 Payload Too Large
      ) {
        Toast.show({
          type: "error",
          text1: "File Too Large",
          text2: "The image is too large to upload.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Upload Error",
          text2: error instanceof Error ? error.message : "Unknown error",
        });
      }

      return null;
    }
  };

  // Upload multiple photos
  const uploadPhotos = async (
    photos: ImagePickerAsset[],
    tempSpotId: string,
    userId: string,
    deferSaving: boolean = false
  ): Promise<string[]> => {
    const totalPhotos = photos.length;
    console.log(`Starting upload of ${totalPhotos} photos`);

    if (totalPhotos === 0) {
      throw new Error("No photos to upload");
    }

    const uploadedUrls: string[] = [];
    let uploadedCount = 0;

    try {
      for (const photo of photos) {
        const url = await uploadPhoto(
          photo,
          tempSpotId,
          userId,
          (progress) => {
            // You can track individual photo progress here if needed
          },
          deferSaving // Pass through the deferSaving flag
        );

        if (url) {
          uploadedUrls.push(url);
          uploadedCount++;
        }
      }

      if (uploadedCount === 0) {
        throw new Error("No photos were successfully uploaded");
      }

      return uploadedUrls;
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
    savePhotoRecord, // Export the savePhotoRecord function
  };
};
