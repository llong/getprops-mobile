import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Avatar, Icon, useTheme } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { ProfileInfo } from "./components/ProfileInfo";
import { useAuth } from "@/hooks/useAuth";
import { useProfileQuery, useSocialStatsQuery } from "@/hooks/useProfileQueries";
import { TouchableOpacity } from "react-native";
import { useToggleFollow } from "@/hooks/useFeedQueries";
import { chatService } from "@/services/chatService";
import Toast from "react-native-toast-message";
import { supabase } from "@/utils/supabase";
import type { UserProfile } from "@/types";

export const ProfileScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation() as any;
  const { user, signOut } = useAuth();

  const { data: profile } = useProfileQuery(user?.id);
  const { data: stats } = useSocialStatsQuery(user?.id);
  const toggleFollowMutation = useToggleFollow();

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkIfFollowing = async () => {
      if (user?.id && profile?.id && user.id !== profile.id) {
        const { data } = await supabase
          .from('user_follows')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .maybeSingle();
        setIsFollowing(!!data);
      } else {
        setIsFollowing(false);
      }
    };
    checkIfFollowing();
  }, [user?.id, profile?.id]);


  const handleToggleFollow = async () => {
    if (!user?.id || !profile?.id || user.id === profile.id) return;

    try {
      await toggleFollowMutation.mutateAsync(profile.id);
      setIsFollowing(prev => !prev); // Optimistic update
      Toast.show({
        type: 'success',
        text1: isFollowing ? `Unfollowed @${profile.username}` : `Following @${profile.username}`,
        position: 'top',
      });
    } catch (error) {
      console.error('Failed to toggle follow', error);
      Toast.show({
        type: 'error',
        text1: 'Follow action failed',
        position: 'top',
      });
    }
  };

  const handleMessageUser = async () => {
    if (!user?.id || !profile?.id) {
      Toast.show({
        type: 'error',
        text1: 'Authentication required to message',
        position: 'top',
      });
      return;
    }
    if (user.id === profile.id) {
      Toast.show({
        type: 'info',
        text1: 'You cannot message yourself',
        position: 'top',
      });
      return;
    }

    try {
      const chatId = await chatService.getOrCreate1on1(user.id, profile.id);
      navigation.navigate("ChatStack", { screen: "ChatRoom", params: { conversationId: chatId, title: profile.displayName || profile.username } });
    } catch (error) {
      console.error('Failed to start chat', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to start chat',
        position: 'top',
      });
    }
  };

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
              profile?.avatarUrl ? { uri: profile.avatarUrl } : undefined
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

        {user?.id === profile?.id ? (
          <Button
            title="Edit Profile"
            type="outline"
            onPress={handleEditProfile}
            containerStyle={styles.editButton}
            buttonStyle={{ borderColor: theme.colors.primary }}
            titleStyle={{ color: theme.colors.primary }}
          />
        ) : (
          <View style={styles.profileActions}>
            <Button
              title={isFollowing ? "Following" : "Follow"}
              type={isFollowing ? "outline" : "solid"}
              size="sm"
              buttonStyle={[
                styles.followButton,
                !isFollowing && { backgroundColor: '#000' }
              ]}
              titleStyle={[
                styles.followTitle,
                isFollowing ? { color: '#000' } : { color: '#fff' }
              ]}
              onPress={handleToggleFollow}
              loading={toggleFollowMutation.isPending}
            />
            <Button
              title="Message"
              type="outline"
              size="sm"
              onPress={handleMessageUser}
              containerStyle={styles.messageButton}
            />
          </View>
        )}
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
        <ProfileInfo profile={profile as UserProfile | null} />
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
  profileActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10, // Add spacing between buttons
  },
  followButton: {
    flex: 1,
    borderRadius: 20,
    height: 40,
    borderColor: '#cfd9de',
  },
  followTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  messageButton: {
    flex: 1,
    borderRadius: 20,
    height: 40,
    borderColor: '#cfd9de',
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