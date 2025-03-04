import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@rneui/themed";

interface InfoToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const InfoToast: React.FC<InfoToastProps> = ({
  message,
  onClose,
  duration = 3000,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });

    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });

    fadeIn.start();

    const timer = setTimeout(() => {
      fadeOut.start(() => onClose());
    }, duration);

    return () => {
      clearTimeout(timer);
      fadeIn.stop();
      fadeOut.stop();
    };
  }, [fadeAnim, duration, onClose]);

  const handleDontShowAgain = async () => {
    try {
      await AsyncStorage.setItem("@spots_info_toast_hidden", "true");
      onClose();
    } catch (error) {
      console.error("Error saving toast preference:", error);
    }
  };

  return (
    <TouchableOpacity onPress={onClose} style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.content}>
          <FontAwesome name="info-circle" size={20} color="#fff" />
          <Text style={styles.message}>{message}</Text>
        </View>
        <Button
          type="clear"
          onPress={handleDontShowAgain}
          title={"Don't show again"}
          size="sm"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: "center",
  },
  toast: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    maxWidth: "90%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  message: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 14,
  },
  dontShow: {
    marginLeft: 10,
  },
});

export default InfoToast;
