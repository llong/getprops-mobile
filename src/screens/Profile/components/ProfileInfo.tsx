import React from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Text, Icon } from "@rneui/themed";
import { UserProfile } from "@/types/profile";

interface ProfileInfoProps {
  profile: UserProfile | null;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const handleInstagramPress = () => {
    if (profile?.instagram_handle) {
      Linking.openURL(`https://instagram.com/${profile.instagram_handle}`);
    }
  };

  return (
    <View style={styles.container}>
      {profile?.bio && (
        <View style={styles.section}>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>
      )}

      {profile?.instagram_handle && (
        <View style={styles.socialLink}>
          <Icon
            name="instagram"
            type="font-awesome"
            size={24}
            color="#E1306C"
            onPress={handleInstagramPress}
          />
          <Text style={styles.instagramHandle} onPress={handleInstagramPress}>
            @{profile.instagram_handle}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  instagramHandle: {
    marginLeft: 10,
    color: "#E1306C",
    fontSize: 16,
  },
});
