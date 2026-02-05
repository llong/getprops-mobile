import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";
import { v4 as uuidv4 } from "uuid";
import type { PhotoMetadata, PhotoUploadResult } from "@/types";

const MAX_IMAGE_DIMENSION = 1920;
const MAX_FILE_SIZE = 800 * 1024;

export const mediaService = {
  /**
   * Resizes and compresses an image using Expo ImageManipulator.
   */
  async optimizeImage(uri: string): Promise<string> {
    try {
      const { width, height } = await new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          Image.getSize(
            uri,
            (w, h) => resolve({ width: w, height: h }),
            (err) => reject(err)
          );
        }
      );

      let actions = [];
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        const aspectRatio = width / height;
        let newWidth, newHeight;

        if (width > height) {
          newWidth = Math.min(width, MAX_IMAGE_DIMENSION);
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newHeight = Math.min(height, MAX_IMAGE_DIMENSION);
          newWidth = Math.round(newHeight * aspectRatio);
        }
        actions.push({ resize: { width: newWidth, height: newHeight } });
      }

      const result = await ImageManipulator.manipulateAsync(uri, actions, {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return result.uri;
    } catch (error) {
      console.error("Image optimization failed", error);
      return uri;
    }
  },

  /**
   * Generates a small and large thumbnail.
   */
  async generateThumbnails(uri: string): Promise<{ small: string; large: string }> {
    const [small, large] = await Promise.all([
      ImageManipulator.manipulateAsync(uri, [{ resize: { width: 300 } }], {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }),
      ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }),
    ]);

    return {
      small: small.uri,
      large: large.uri,
    };
  },

  /**
   * Uploads a file to Supabase Storage.
   */
  async uploadToStorage(bucket: string, path: string, uri: string, contentType: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: path.split("/").pop(),
      type: contentType,
    } as any);

    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = (supabase as any).supabaseUrl;

    const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "x-upsert": "true",
      },
      body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },

  /**
   * Complete photo upload flow with optimization and thumbnails.
   */
  async uploadPhoto(file: { uri: string, width: number, height: number }, spotId: string, userId: string): Promise<PhotoUploadResult> {
    const optimizedUri = await this.optimizeImage(file.uri);
    const thumbnails = await this.generateThumbnails(optimizedUri);

    const fileId = uuidv4();
    const originalPath = `spots/${spotId}/photos/originals/${fileId}.jpg`;
    const smallPath = `spots/${spotId}/photos/thumbnails/small/${fileId}.jpg`;
    const largePath = `spots/${spotId}/photos/thumbnails/large/${fileId}.jpg`;

    const [originalUrl, thumbnailSmallUrl, thumbnailLargeUrl] = await Promise.all([
      this.uploadToStorage("spot-media", originalPath, optimizedUri, "image/jpeg"),
      this.uploadToStorage("spot-media", smallPath, thumbnails.small, "image/jpeg"),
      this.uploadToStorage("spot-media", largePath, thumbnails.large, "image/jpeg"),
    ]);

    return {
      originalUrl,
      thumbnailSmallUrl,
      thumbnailLargeUrl,
      metadata: {
        width: file.width,
        height: file.height,
        takenAt: new Date().toISOString(),
      }
    };
  }
};