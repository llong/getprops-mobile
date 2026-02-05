import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "@screens/Profile/ProfileScreen";
import { EditProfileScreen } from "@screens/Profile/EditProfileScreen";
import { UserProfileScreen } from "@screens/Profile/UserProfileScreen";
import { UserListScreen } from "@screens/Profile/UserListScreen";
import { ProfileStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="UserList"
        component={UserListScreen}
        options={({ route }) => ({
          title: route.params.type === "followers" ? "Followers" : "Following",
        })}
      />
    </Stack.Navigator>
  );
};
