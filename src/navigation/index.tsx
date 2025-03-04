import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SpotsNavigator } from "./SpotsNavigator";
import { ProfileNavigator } from "./ProfileNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { useAtom } from "jotai";
import { authAtom } from "@state/auth";
import { linking } from "@utils/linking";
import { FontAwesome } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const Navigation = () => {
  const [user] = useAtom(authAtom);

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: false,
        colors: {
          primary: "#000",
          background: "#fff",
          card: "#fff",
          text: "#000",
          border: "#E5E5E5",
          notification: "#FF3B30",
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
          },
        }}
      >
        <Tab.Screen
          name="Spots Navigator"
          component={SpotsNavigator}
          options={{
            title: "Spots",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="map-marker" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name={user ? "Profile" : "Sign In"}
          component={user ? ProfileNavigator : AuthNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
