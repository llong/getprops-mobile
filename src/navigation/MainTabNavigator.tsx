import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ProfileNavigator } from "./ProfileNavigator";
import { SpotsNavigator } from "./SpotsNavigator";
import { RootTabParamList } from "@/types/navigation";
import { Icon } from "@rneui/themed";

const Tab = createBottomTabNavigator<RootTabParamList>();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";

          if (route.name === "SpotStack") {
            iconName = focused ? "map" : "map-o";
          } else if (route.name === "ProfileStack") {
            iconName = focused ? "user" : "user-o";
          }

          return (
            <Icon
              name={iconName}
              type="font-awesome"
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="SpotStack"
        component={SpotsNavigator}
        options={{ headerShown: false, title: "Spots" }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileNavigator}
        options={{ headerShown: false, title: "Profile" }}
      />
    </Tab.Navigator>
  );
};
