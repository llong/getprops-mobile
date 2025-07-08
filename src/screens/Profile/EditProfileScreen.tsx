import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Input, Button, Avatar, Icon } from "@rneui/themed";
import { useProfile } from "@hooks/useProfile";
import * as ImagePicker from "expo-image-picker";
import { RiderType } from "@/types/database";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { ProfileStackNavigationProp } from "@/types/navigation";
import { supabase } from "@/utils/supabase";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { CountryPicker } from "./components/CountryPicker";
import { ProfileFormData } from "@/types/profile";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

export const EditProfileScreen = () => {
  const navigation = useNavigation<ProfileStackNavigationProp>();
  const { profile, loading, updateProfile, pendingAvatar, setPendingAvatar } =
    useProfile();

  console.log("EditProfileScreen - Profile data:", profile);

  const [formData, setFormData] = useState<ProfileFormData>(() => ({
    username: profile?.username ?? "",
    city: profile?.city ?? "",
    country: profile?.country ?? "",
    rider_type: profile?.rider_type ?? undefined,
    bio: profile?.bio ?? "",
    instagram_handle: profile?.instagram_handle ?? "",
  }));

  useEffect(() => {
    if (profile) {
      console.log("Updating form data with profile:", profile);
      setFormData({
        username: profile.username ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        rider_type: profile.rider_type ?? undefined,
        bio: profile.bio ?? "",
        instagram_handle: profile.instagram_handle ?? "",
      });
    }
  }, [profile]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = async (username: string) => {
    if (!username) return "Username is required";
    if (username === profile?.username) return null;

    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (data) return "Username already taken";
    return null;
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const usernameError = await validateUsername(formData.username);
      if (usernameError) {
        setError(usernameError);
        return;
      }

      await updateProfile(formData, pendingAvatar ?? undefined);
      navigation.goBack();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPendingAvatar(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error("Error selecting avatar:", err);
      setError(
        typeof err === "string" ? err : err.message ?? "Failed to select image"
      );
    }
  };

  const getAvatarSource = () => {
    if (pendingAvatar) return { uri: pendingAvatar };
    if (profile?.avatar_url) return { uri: profile.avatar_url };
    return undefined;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleSelectAvatar}
          activeOpacity={0.8}
        >
          <Avatar
            size={120}
            rounded
            source={getAvatarSource()}
            icon={
              !pendingAvatar && !profile?.avatar_url
                ? { name: "user-circle", type: "font-awesome" }
                : undefined
            }
          />
          <View style={styles.changeAvatarOverlay}>
            <Text style={styles.changeAvatarText}>
              <Icon name="camera" type="font-awesome" size={16} color="white" />{" "}
              Change
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Input
        label="Username"
        value={formData.username}
        onChangeText={(text) =>
          setFormData((prev: ProfileFormData) => ({ ...prev, username: text }))
        }
        autoCapitalize="none"
        disabled={isSubmitting}
      />

      <Input
        label="City"
        value={formData.city}
        onChangeText={(text) =>
          setFormData((prev: ProfileFormData) => ({ ...prev, city: text }))
        }
      />

      <CountryPicker
        value={formData.country ?? ""}
        onChange={(country) =>
          setFormData((prev: ProfileFormData) => ({ ...prev, country }))
        }
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Rider Type</Text>
        <Picker
          selectedValue={formData.rider_type}
          onValueChange={(value) =>
            setFormData((prev: ProfileFormData) => ({
              ...prev,
              rider_type: value as RiderType,
            }))
          }
        >
          <Picker.Item label="Select type" value={undefined} />
          <Picker.Item label="Inline" value="inline" />
          <Picker.Item label="Skateboard" value="skateboard" />
          <Picker.Item label="BMX" value="bmx" />
          <Picker.Item label="Scooter" value="scooter" />
        </Picker>
      </View>

      <Input
        label="Bio"
        value={formData.bio}
        onChangeText={(text) =>
          setFormData((prev: ProfileFormData) => ({ ...prev, bio: text }))
        }
        multiline
        numberOfLines={4}
      />

      <Input
        label="Instagram Handle"
        value={formData.instagram_handle}
        onChangeText={(text) =>
          setFormData((prev: ProfileFormData) => ({
            ...prev,
            instagram_handle: text,
          }))
        }
        placeholder="@username"
        autoCapitalize="none"
      />

      <SafeAreaView
        edges={["bottom" as Edge]}
        style={styles.saveButtonContainer}
      >
        <Button
          title="Save Profile"
          onPress={handleUpdateProfile}
          disabled={isSubmitting}
          loading={isSubmitting}
          containerStyle={styles.saveButton}
          color="primary"
          raised
        />
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatarWrapper: {
    position: "relative",
  },
  changeAvatarOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  changeAvatarText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "gray",
    marginBottom: 5,
  },
  saveButtonContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    marginBottom: 0,
  },
});
