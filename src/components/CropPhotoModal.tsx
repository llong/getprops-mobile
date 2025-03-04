import React from "react";
import { Modal, View, StyleSheet, Dimensions, Image } from "react-native";
import { Button } from "@rneui/themed";
import * as ImageManipulator from "expo-image-manipulator";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

interface CropPhotoModalProps {
  visible: boolean;
  imageUri: string;
  originalWidth: number;
  originalHeight: number;
  onCrop: (croppedUri: string) => void;
  onClose: () => void;
}

const CropPhotoModal: React.FC<CropPhotoModalProps> = ({
  visible,
  imageUri,
  originalWidth,
  originalHeight,
  onCrop,
  onClose,
}) => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Calculate image dimensions to fit screen while maintaining aspect ratio
  const scale = Math.min(
    (screenWidth * 0.9) / originalWidth,
    (screenHeight * 0.7) / originalHeight
  );
  const displayWidth = originalWidth * scale;
  const displayHeight = originalHeight * scale;

  // Crop area state
  const cropX = useSharedValue(0);
  const cropY = useSharedValue(0);
  const cropWidth = useSharedValue(displayWidth / 2); // Default crop width
  const cropHeight = useSharedValue(displayHeight / 2); // Default crop height
  const scaleValue = useSharedValue(1); // Scale value for pinch gesture

  const panGesture = Gesture.Pan().onUpdate((e) => {
    cropX.value = Math.max(
      0,
      Math.min(e.translationX, displayWidth - cropWidth.value)
    );
    cropY.value = Math.max(
      0,
      Math.min(e.translationY, displayHeight - cropHeight.value)
    );
  });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scaleValue.value = e.scale;
      cropWidth.value = Math.max(50, (displayWidth / 2) * scaleValue.value); // Minimum width
      cropHeight.value = Math.max(50, (displayHeight / 2) * scaleValue.value); // Minimum height
    })
    .onEnd(() => {
      scaleValue.value = 1; // Reset scale after pinch
    });

  const cropBoxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cropX.value },
      { translateY: cropY.value },
      { scaleX: scaleValue.value },
      { scaleY: scaleValue.value },
    ],
    width: cropWidth.value,
    height: cropHeight.value,
    borderWidth: 2,
    borderColor: "white",
    position: "absolute",
  }));

  const handleCrop = async () => {
    try {
      const scaleBack = originalWidth / displayWidth;
      const originX = Math.floor(cropX.value * scaleBack);
      const originY = Math.floor(cropY.value * scaleBack);
      const cropW = Math.floor(cropWidth.value * scaleBack);
      const cropH = Math.floor(cropHeight.value * scaleBack);

      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX,
              originY,
              width: cropW,
              height: cropH,
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      onCrop(manipResult.uri);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.modalContent}>
          <View
            style={[
              styles.imageContainer,
              { width: displayWidth, height: displayHeight },
            ]}
          >
            <Image
              source={{ uri: imageUri }}
              style={{ width: displayWidth, height: displayHeight }}
              resizeMode="contain"
            />
            <GestureDetector
              gesture={Gesture.Simultaneous(panGesture, pinchGesture)}
            >
              <Animated.View style={cropBoxStyle} />
            </GestureDetector>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Crop"
              onPress={handleCrop}
              buttonStyle={styles.cropButton}
            />
            <Button
              title="Cancel"
              onPress={onClose}
              type="outline"
              buttonStyle={styles.cancelButton}
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "80%",
    gap: 10,
  },
  cropButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: "#007AFF",
    borderRadius: 8,
  },
});

export default CropPhotoModal;
