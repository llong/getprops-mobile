import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ProfileNavigator } from "./ProfileNavigator";
import { SpotsNavigator } from "./SpotsNavigator";
import { FeedNavigator } from "./FeedNavigator";
import { ChatNavigator } from "./ChatNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { NotificationsScreen } from "@/screens/Notifications/NotificationsScreen";
import { RootTabParamList } from "@/types/navigation";
import { Icon } from "@rneui/themed";
import { useAtomValue } from "jotai";
import { userAtom } from "@/state/auth";

const Tab = createBottomTabNavigator<RootTabParamList>();

export const MainTabNavigator = () => {
  const auth = useAtomValue(userAtom);
  const user = auth?.user || null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#1d9bf0",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";
          let iconType = "font-awesome";

          if (route.name === "FeedStack") {
            iconName = focused ? "home" : "home"; // Changed to material/ion style if needed, but keeping FA parity
            iconType = "material";
          } else if (route.name === "SpotStack") {
            iconName = focused ? "explore" : "explore";
            iconType = "material";
          } else if (route.name === "ChatStack") {
            iconName = focused ? "chat-bubble" : "chat-bubble-outline";
            iconType = "material";
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-none";
            iconType = "material";
          } else if (route.name === "ProfileStack") {
            iconName = focused ? "person" : "person-outline";
            iconType = "material";
          }

          return (
            <Icon
              name={iconName}
              type={iconType}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="FeedStack"
        component={FeedNavigator}
        options={{ headerShown: false, title: "Feed" }}
      />
      <Tab.Screen
        name="SpotStack"
        component={SpotsNavigator}
        options={{ headerShown: false, title: "Spots" }}
      />
      {user && (
        <>
          <Tab.Screen
            name="ChatStack"
            component={ChatNavigator}
            options={{ 
              headerShown: false, 
              title: "Inbox" 
            }}
          />
          <Tab.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ 
              title: "Alerts" 
            }}
          />
        </>
      )}
      <Tab.Screen
        name="ProfileStack"
        component={user ? ProfileNavigator : AuthNavigator}
        options={{ 
          headerShown: false, 
          title: user ? "Profile" : "Sign In",
          tabBarStyle: !user ? { display: 'none' } : undefined 
        }}
      />
    </Tab.Navigator>
  );
};
