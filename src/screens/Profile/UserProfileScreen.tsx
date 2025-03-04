import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Avatar } from "@rneui/themed";
import { useProfile } from "@hooks/useProfile";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileInfo } from "./components/ProfileInfo";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";

type UserProfileRouteProp = RouteProp<RootStackParamList, "UserProfile">;

export const UserProfileScreen = () => {
  const route = useRoute<UserProfileRouteProp>();
  const { userId } = route.params;
  const { profile, loading } = useProfile(userId);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar
          size={100}
          rounded
          source={profile?.avatar_url ? { uri: profile.avatar_url } : undefined}
          icon={
            !profile?.avatar_url
              ? { name: "user-circle", type: "font-awesome", color: "#bbb" }
              : undefined
          }
        />
        <Text h3 style={styles.username}>
          {profile?.username}
        </Text>
        <Text style={styles.location}>
          {profile?.city}
          {profile?.city && profile?.country && ", "}
          {profile?.country}
        </Text>
      </View>

      <ProfileStats profile={profile} />
      <ProfileInfo profile={profile} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 20,
  },
  username: {
    marginTop: 10,
  },
  location: {
    marginTop: 5,
    color: "gray",
  },
});
