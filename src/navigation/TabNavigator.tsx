import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import { SpotsScreen } from "@screens/Spots/SpotsScreen";
import { ProfileScreen } from "@screens/Profile/ProfileScreen";
import { useAtom } from "jotai";
import { authAtom } from "@state/auth";
import { AuthNavigator } from "./AuthNavigator";
import { FontAwesome } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const [user] = useAtom(authAtom);

  return (
    <Tab.Navigator initialRouteName="Spots">
      <Tab.Screen
        name="Spots"
        component={SpotsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="map-marker" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={user ? ProfileScreen : AuthNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" type="font-awesome" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
