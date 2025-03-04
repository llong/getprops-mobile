import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Button, Text, useTheme } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import type { ImagePickerAsset } from "expo-image-picker";

interface PhotoSelectorProps {
  photos: ImagePickerAsset[];
  setPhotos: React.Dispatch<React.SetStateAction<ImagePickerAsset[]>>;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  setPhotos,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError("Camera permission is required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
      aspect: [9, 16],
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhotos((prev) => [...prev, asset]);
    }
  };

  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets]);
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    buttonGroup: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 12,
    },
    buttonContainer: {
      flex: 1,
    },
    buttonTitle: {
      color: theme.colors.black,
      fontSize: 16,
      fontWeight: "600",
    },
    photoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    photoContainer: {
      position: "relative",
    },
    photoThumbnail: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    deletePhotoContainer: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
      <View style={styles.buttonGroup}>
        <Button
          title="Take Photo"
          icon={{
            name: "camera",
            type: "material",
            size: 24,
            color: theme.colors.primary,
            style: { marginRight: 8 },
          }}
          containerStyle={styles.buttonContainer}
          buttonStyle={{
            backgroundColor: "transparent",
            borderColor: theme.colors.primary,
            borderWidth: 2,
          }}
          titleStyle={{ color: theme.colors.primary }}
          onPress={handleTakePhoto}
          type="outline"
        />
        <Button
          title="Choose Photos"
          icon={{
            name: "photo-library",
            type: "material",
            size: 24,
            color: "white",
            style: { marginRight: 8 },
          }}
          containerStyle={styles.buttonContainer}
          buttonStyle={{ backgroundColor: theme.colors.primary }}
          titleStyle={{ color: "white" }}
          onPress={handlePickImages}
        />
      </View>
      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
            <TouchableOpacity
              style={styles.deletePhotoContainer}
              onPress={() => handleDeletePhoto(index)}
            >
              <MaterialIcons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};
