import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { ImageManipulator } from "expo-image-crop";

interface ImageCropperModalProps {
  visible: boolean;
  imageUri: string | null;
  onCrop: (uri: string) => void;
  onClose: () => void;
}

export const ImageCropperModal = ({
  visible,
  imageUri,
  onCrop,
  onClose,
}: ImageCropperModalProps) => {
  if (!imageUri) return null;

  return (
    <Modal visible={visible} transparent>
      <View style={styles.container}>
        <ImageManipulator
          photo={{ uri: imageUri }}
          isVisible={visible}
          onPictureChoosed={({ uri }) => onCrop(uri)}
          onToggleModal={onClose}
          allowRotate={false}
          allowFlip={false}
          fixedMask={{ width: 300, height: 300 }}
          maskType="circle"
          resizeMode="contain"
          backgroundColor="black"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
