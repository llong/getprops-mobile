import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native"; // Import Alert
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@hooks/useAuth";
import { Input, Button, useTheme } from "@rneui/themed";
import { LocationSection } from "./components/LocationSection";
import { SpotTypeSection } from "./components/SpotTypeSection";
import { DifficultySection } from "./components/DifficultySection";
import { KickoutRiskSection } from "./components/KickoutRiskSection";
import { LitToggleSection } from "./components/LitToggleSection";
import { PhotoSelector } from "./components/PhotoSelector";
import { VideoSelector } from "./components/VideoSelector";
import { DifficultyLevel } from "@/types/database";
import { useSpotForm } from "./hooks/useSpotForm";
import * as ImagePicker from "expo-image-picker";
import { VideoAsset, PhotoUploadResult } from "@/types/media";
import { useSpotPhotos } from "@hooks/useSpotPhotos";
import { useSpotVideos } from "@hooks/useSpotVideos";
import { supabase } from "@utils/supabase";
import Toast from "react-native-toast-message";
import { StackScreenProps } from "@react-navigation/stack";
import { SpotsStackParamList } from "@/types/navigation";

type AddSpotScreenProps = StackScreenProps<SpotsStackParamList, "AddSpot">;

export const AddSpotScreen = ({ route }: AddSpotScreenProps) => {
  const { location } = route.params;
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { uploadPhotos } = useSpotPhotos();
  const { setUploading: setVideoUploading, uploadVideos } = useSpotVideos();
  const {
    formData,
    handleNameChange,
    handleSpotTypeToggle,
    isFormValid,
    setFormData,
  } = useSpotForm(location);

  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingBottom: 20,
    },
    map: {
      height: 200,
      marginBottom: 20,
      borderRadius: 8,
      overflow: "hidden",
    },
    addressOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
    },
    addressContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    addressText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 4,
      textAlign: "left",
    },
    addressDetails: {
      fontSize: 14,
      color: "#666",
      marginBottom: 2,
      textAlign: "left",
    },
    scrollContainer: {
      flex: 1,
      padding: 20,
    },
    buttonContainer: {
      padding: 16,
      backgroundColor: "white",
      borderTopWidth: 1,
      borderTopColor: "#eee",
    },
    error: {
      color: "red",
      textAlign: "center",
      marginBottom: 10,
    },
    section: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      margin: 2,
    },
    input: {
      marginBottom: 16,
    },
  });

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    setFormData((prev) => ({ ...prev, difficulty }));
  };

  const handleDescriptionChange = (description: string) => {
    setFormData((prev) => ({ ...prev, description }));
  };

  const handleKickoutRiskChange = (kickoutRisk: number) => {
    setFormData((prev) => ({ ...prev, kickoutRisk }));
  };

  const handleLitToggle = (isLit: boolean) => {
    setFormData((prev) => ({ ...prev, isLit }));
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name.trim()) {
        setError("Spot name is required");
        return;
      }

      if (!photos.length) {
        setError("At least one photo is required");
        return;
      }

      // Start uploading - set state to show loading UI
      setUploading(true);
      setError(null);

      // Step 1: First create the spot in the database to get a real spot ID
      const { id, spot } = await createSpotRecord();
      if (!id) {
        throw new Error("Failed to create spot record");
      }

      console.log(`Created new spot with ID: ${id}`);

      // Step 2: Upload media files using the real spot ID
      try {
        await uploadSpotMedia(id);
        // If successful, proceed to reset and navigate
        resetFormAndNavigate(spot);
      } catch (mediaUploadError: any) {
        // This catch block specifically handles errors from uploadSpotVideos
        console.error(
          "Video upload failed during handleSubmit:",
          mediaUploadError
        );
        setUploading(false); // Stop loading indicator
        Alert.alert(
          "Video Upload Failed",
          `There was an issue uploading one or more videos: ${mediaUploadError.message}. What would you like to do?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => console.log("Spot creation cancelled by user."),
            },
            {
              text: "Save without Videos",
              onPress: () => {
                setVideos([]); // Clear videos
                // We need to re-trigger the final part of handleSubmit without videos
                // This is a simplified approach; a more robust one might involve a separate function
                console.log("Proceeding to save spot without videos.");
                resetFormAndNavigate(spot);
              },
            },
            {
              text: "Retry Video Upload",
              onPress: async () => {
                setUploading(true); // Re-enable loading
                setError(null);
                try {
                  await uploadSpotVideos(id); // Retry only video uploads
                  console.log("Video retry successful.");
                  resetFormAndNavigate(spot);
                } catch (retryError: any) {
                  setUploading(false);
                  setError(`Video upload retry failed: ${retryError.message}`);
                  Alert.alert(
                    "Retry Failed",
                    `Video upload still failed: ${retryError.message}`
                  );
                }
              },
            },
          ]
        );
        return; // Stop further execution of handleSubmit if videos failed and user is prompted
      }
    } catch (submitError) {
      // This catches errors from createSpotRecord or other general errors
      console.error("Error creating spot:", submitError);
      const errorMessage =
        submitError instanceof Error ? submitError.message : "Unknown error";
      setError(`Error adding spot: ${errorMessage}`);
      setUploading(false);
    }
  };

  const resetFormAndNavigate = (spot: any) => {
    // Success! Reset form by setting initial values
    setFormData({
      name: "",
      description: null,
      latitude: 0,
      longitude: 0,
      spotType: [],
      kickoutRisk: 1,
      difficulty: "beginner" as DifficultyLevel,
      isLit: false,
      streetNumber: null,
      street: null,
      city: null,
      region: null,
      country: null,
      postalCode: null,
    });
    setPhotos([]);
    setVideos([]);

    Toast.show({
      type: "success",
      text1: "Success!",
      text2: "Spot added successfully",
    });

    setPhotos([]);
    setVideos([]);

    Toast.show({
      type: "success",
      text1: "Success!",
      text2: "Spot added successfully",
    });

    // Reset form state
    setUploading(false);

    // Navigate to spot details
    console.log(
      "[AddSpotScreen] Navigating with spot:",
      JSON.stringify(spot, null, 2)
    );
    const completeSpot = {
      ...spot,
      photos: [], // Will be loaded in SpotDetailsScreen
      spotType: Array.isArray(spot.spotType)
        ? spot.spotType
        : spot.spotType
        ? [spot.spotType]
        : [], // Ensure spotType is an array
    };
    navigation.navigate("SpotDetails", { spotId: spot.id, spot: completeSpot });
  };

  // Helper function for creating spot record
  const createSpotRecord = async () => {
    // Create a properly formatted location object from formData
    const locationData = {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    };

    // Create the spot record in the database
    const { data: spotData, error: spotError } = await supabase
      .from("spots")
      .insert([
        {
          name: formData.name,
          description: formData.description,
          location: locationData,
          spotType: formData.spotType,
          difficulty: formData.difficulty,
          kickout_risk: formData.kickoutRisk,
          is_lit: formData.isLit,
          created_by: user!.id,
          latitude: formData.latitude,
          longitude: formData.longitude,
          created_at: new Date().toISOString(),
          address: formData.street
            ? `${formData.streetNumber ?? ""} ${formData.street}`.trim()
            : null,
          city: formData.city ?? null,
          country: formData.country ?? null,
        },
      ])
      .select();

    if (spotError) {
      throw new Error(`Error creating spot: ${spotError.message}`);
    }

    if (!spotData || spotData.length === 0) {
      throw new Error("Failed to create spot record");
    }

    // Return the new spot ID and data
    return { id: spotData[0].id, spot: spotData[0] };
  };

  // Helper function for creating photo database records
  const createPhotoRecords = async (
    uploadResults: PhotoUploadResult[],
    spotId: string
  ): Promise<void> => {
    for (const result of uploadResults) {
      try {
        const { error } = await supabase.from("spot_photos").insert({
          spot_id: spotId,
          user_id: user!.id,
          url: result.originalUrl,
          thumbnail_small_url: result.thumbnailSmallUrl,
          thumbnail_large_url: result.thumbnailLargeUrl,
          width: result.metadata.width,
          height: result.metadata.height,
          taken_at: result.metadata.takenAt,
          location: result.metadata.location,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.warn("Failed to create photo record:", error);
        }
      } catch (photoRecordError) {
        console.warn("Failed to create photo record:", photoRecordError);
        // Continue with other photos even if database record creation fails
      }
    }
  };

  // Helper function for uploading videos
  const uploadSpotVideos = async (spotId: string): Promise<boolean> => {
    if (videos.length === 0) return true; // No videos to upload, success.

    setVideoUploading(true);
    try {
      await uploadVideos(videos, spotId);
      setVideoUploading(false);
      return true; // Videos uploaded successfully
    } catch (videoUploadError) {
      console.error("Error uploading videos:", videoUploadError);
      setVideoUploading(false);
      // Instead of setting local error, throw it to be handled by handleSubmit
      throw videoUploadError;
    }
  };

  // Helper function for uploading photos and videos
  const uploadSpotMedia = async (spotId: string): Promise<void> => {
    // Upload photos first
    try {
      const uploadResults = await uploadPhotos(photos, spotId, user!.id, true);
      await createPhotoRecords(uploadResults, spotId);
    } catch (photoUploadError) {
      console.error("Error uploading photos:", photoUploadError);
      const errorMessage =
        photoUploadError instanceof Error
          ? photoUploadError.message
          : "Unknown photo upload error";
      setError(
        `Warning: Some photos may not have uploaded properly: ${errorMessage}`
      );
      // Decide if you want to stop here or proceed with video upload attempt
      // For now, we'll let it proceed and video upload can handle its own errors
    }

    // Upload videos if any
    if (videos.length > 0) {
      await uploadSpotVideos(spotId); // This will now throw if it fails, to be caught by handleSubmit
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LocationSection
        location={location}
        latitude={formData.latitude}
        longitude={formData.longitude}
      />

      <ScrollView style={styles.scrollContainer}>
        {error && <Text style={styles.error}>{error}</Text>}

        <Input
          placeholder="Spot Name"
          value={formData.name}
          onChangeText={handleNameChange}
          autoCapitalize="words"
          label="Spot Name"
        />

        <Input
          placeholder="Description (optional)"
          value={formData.description ?? ""}
          onChangeText={handleDescriptionChange}
          multiline
          numberOfLines={3}
          label="Description"
        />

        <SpotTypeSection
          selectedTypes={formData.spotType}
          onTypeToggle={handleSpotTypeToggle}
        />

        <DifficultySection
          selectedDifficulty={formData.difficulty}
          onDifficultyChange={handleDifficultyChange}
        />

        <KickoutRiskSection
          kickoutRisk={formData.kickoutRisk}
          onKickoutRiskChange={handleKickoutRiskChange}
        />

        <LitToggleSection
          isLit={formData.isLit}
          onLitToggle={handleLitToggle}
        />

        <PhotoSelector photos={photos} setPhotos={setPhotos} />

        <VideoSelector videos={videos} setVideos={setVideos} />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={uploading ? "Uploading..." : "Add Spot"}
          onPress={handleSubmit}
          disabled={uploading || !isFormValid()}
          loading={uploading}
          color={theme.colors.grey1}
        />
      </View>
    </ScrollView>
  );
};
