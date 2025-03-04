import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { linking } from "@utils/linking";

type Props = {
  children: React.ReactNode;
};

export const AnimatedSwitcher = ({ children }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      fadeAnim.setValue(0);
    };
  }, [children]);

  return (
    <NavigationContainer linking={linking}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {children}
      </Animated.View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
