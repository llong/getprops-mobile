import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import { useAtomValue } from "jotai";
import { userAtom } from "@state/auth";
import { linking } from "@utils/linking";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export const Navigation = () => {
  console.log("Navigation Container Rendering...");
  const auth = useAtomValue(userAtom);
  const user = auth?.user || null;

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: false,
        colors: {
          primary: "#1d9bf0",
          background: "#fff",
          card: "#fff",
          text: "#000",
          border: "#E5E5E5",
          notification: "#FF3B30",
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
