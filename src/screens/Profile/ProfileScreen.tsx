import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Avatar, Icon, useTheme } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { ProfileInfo } from "./components/ProfileInfo";
import { useAuth } from "@/hooks/useAuth";
import { useProfileQuery, useSocialStatsQuery } from "@/hooks/useProfileQueries";
import { TouchableOpacity } from "react-native";

export const ProfileScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation() as any;
  const { user, signOut } = useAuth();
  
  const { data: profile } = useProfileQuery(user?.id);
  const { data: stats } = useSocialStatsQuery(user?.id);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: theme.colors.white }]}>
        <View style={styles.coverPhoto}>
          <Icon
            name="image"
            type="font-awesome"
            color={theme.colors.grey5}
            size={32}
          />
        </View>

        <View style={styles.profileSection}>
          <Avatar
            size={100}
            rounded
            source={
              profile?.avatar_url ? { uri: profile.avatar_url } : undefined
            }
            icon={{
              name: "account-circle",
              type: "material-community",
              color: theme.colors.grey3,
              size: 100,
            }}
            containerStyle={[
              styles.avatar,
              { borderColor: theme.colors.white },
            ]}
          />

          <Text style={[styles.username, { color: theme.colors.black }]}>
            {profile?.username ?? user?.email}
          </Text>

          {/* Fix the location rendering logic */}
          {(profile?.city || profile?.country) && (
            <View style={styles.locationContainer}>
              <Icon
                name="map-marker"
                type="font-awesome"
                size={16}
                color={theme.colors.grey1}
                style={styles.locationIcon}
              />
              <Text style={[styles.location, { color: theme.colors.grey1 }]}>
                {[profile?.city, profile?.country].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}
        </View>

        <Button
          title="Edit Profile"
          type="outline"
          onPress={handleEditProfile}
          containerStyle={styles.editButton}
          buttonStyle={{ borderColor: theme.colors.primary }}
          titleStyle={{ color: theme.colors.primary }}
        />
      </View>

      {/* Stats Section */}
      <View
        style={[styles.statsContainer, { backgroundColor: theme.colors.white }]}
      >
        <TouchableOpacity 
          style={styles.statBox}
          onPress={() => navigation.navigate("UserList", { userId: user?.id, type: 'followers' })}
        >
          <Text style={[styles.statValue, { color: theme.colors.black }]}>
            {stats?.followerCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.grey1 }]}>
            Followers
          </Text>
        </TouchableOpacity>
        <View
          style={[styles.statDivider, { backgroundColor: theme.colors.grey5 }]}
        />
        <TouchableOpacity 
          style={styles.statBox}
          onPress={() => navigation.navigate("UserList", { userId: user?.id, type: 'following' })}
        >
          <Text style={[styles.statValue, { color: theme.colors.black }]}>
            {stats?.followingCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.grey1 }]}>
            Following
          </Text>
        </TouchableOpacity>
        <View
          style={[styles.statDivider, { backgroundColor: theme.colors.grey5 }]}
        />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.black }]}>
            {stats?.favorites?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.grey1 }]}>
            Favorites
          </Text>
        </View>
      </View>

      {/* Profile Info Section */}
      <View
        style={[styles.infoContainer, { backgroundColor: theme.colors.white }]}
      >
        <ProfileInfo profile={profile} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Sign Out"
          type="outline"
          onPress={signOut}
          containerStyle={styles.signOutButton}
          buttonStyle={{ borderColor: theme.colors.error }}
          titleStyle={{ color: theme.colors.error }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
  },
  coverPhoto: {
    height: 150,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginTop: -50,
    paddingBottom: 20,
  },
  avatar: {
    borderWidth: 4,
    marginBottom: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationIcon: {
    marginRight: 4,
  },
  location: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 12,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: "60%",
    alignSelf: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  infoContainer: {
    borderRadius: 20,
    marginBottom: 12,
  },
  actions: {
    padding: 20,
  },
  signOutButton: {
    marginTop: 8,
  },
});
