import { useState, useEffect, useCallback } from "react";
import { supabase } from "@utils/supabase";
import type { UserProfile, ProfileFormData } from "@/types/profile";
import { useAuth } from "./useAuth";
import { decode } from "base64-arraybuffer";
import * as ImageManipulator from "expo-image-manipulator";

// Add a cache to store profiles
const profileCache: {
  [key: string]: { data: UserProfile; timestamp: number };
} = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Add type for the upload response
type SupabaseUploadResponse = {
  error: Error | null;
  data: {
    path: string;
  } | null;
};

const resizeAndCompressImage = async (uri: string) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 250 } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  return result;
};

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const profileId = userId ?? user?.id;

  // Memoize the initial state function
  const getInitialState = useCallback(() => {
    const cachedProfile = profileCache[profileId ?? ""];
    if (
      cachedProfile &&
      Date.now() - cachedProfile.timestamp < CACHE_DURATION
    ) {
      return cachedProfile.data;
    }
    return null;
  }, [profileId]);

  const [profile, setProfile] = useState<UserProfile | null>(getInitialState);
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);

  const isOwnProfile = !userId || userId === user?.id;

  const fetchProfile = useCallback(
    async (force: boolean = false) => {
      if (!profileId) return;

      // Check cache first unless force refresh is requested
      if (!force) {
        const cachedProfile = profileCache[profileId];
        if (
          cachedProfile &&
          Date.now() - cachedProfile.timestamp < CACHE_DURATION
        ) {
          setProfile(cachedProfile.data);
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        if (fetchError) throw fetchError;

        // Update cache
        profileCache[profileId] = {
          data,
          timestamp: Date.now(),
        };

        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [profileId]
  );

  // Memoize refreshProfile to prevent unnecessary re-renders
  const refreshProfile = useCallback(() => {
    return fetchProfile(true);
  }, [fetchProfile]);

  // Only fetch on mount or when profileId changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (
    formData: ProfileFormData,
    newAvatarUri?: string
  ) => {
    if (!isOwnProfile || !user) return;

    try {
      setLoading(true);

      let avatarUrl = profile?.avatar_url;

      // Upload new avatar if provided
      if (newAvatarUri) {
        const processedImage = await resizeAndCompressImage(newAvatarUri);
        if (!processedImage.base64) {
          throw new Error("Failed to process image");
        }

        const buffer = decode(processedImage.base64);
        const fileName = user.id;

        try {
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, buffer, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) {
            console.error("Upload error details:", uploadError);
            throw new Error(uploadError.message);
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(fileName);

          if (!publicUrl) throw new Error("Failed to get public URL");
          avatarUrl = publicUrl;
        } catch (uploadErr) {
          console.error("Detailed upload error:", uploadErr);
          throw uploadErr;
        }
      }

      // Update profile with all data
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ...formData,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      // Fetch fresh data
      await fetchProfile(true);

      setPendingAvatar(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      throw new Error(
        err instanceof Error
          ? `Profile update failed: ${err.message}`
          : "Profile update failed: Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    isOwnProfile,
    pendingAvatar,
    setPendingAvatar,
    updateProfile,
    refreshProfile,
  };
};
