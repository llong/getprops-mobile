import { NavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type SpotsStackParamList = {
  SpotsList: undefined;
  SpotMap: undefined;
  SpotDetails: { spotId: string; spot?: any };
  AddSpot: {
    location: LocationParams;
  };
  EditSpot: { spotId: string };
  SpotMedia: { spotId: string };
  Spots: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  UserProfile: { userId: string };
  UserList: { userId: string; type: 'followers' | 'following' };
};

export type AuthStackParamList = {
  Auth: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  SignUp: undefined;
  UserProfile: { userId: string };
  SpotDetails: { spotId: string; spot?: any };
  EditProfile: undefined;
  Search: undefined;
  Spots: undefined;
  ChatRoom: { conversationId: string };
  Notifications: undefined;
};

export type ChatStackParamList = {
  ChatInbox: undefined;
  ChatRoom: { conversationId: string; title?: string; fromNotification?: boolean };
  CreateGroup: undefined;
  ChatSettings: { conversationId: string; chatTitle: string };
};

export type RootTabParamList = {
  FeedStack: undefined;
  SpotStack: undefined;
  ProfileStack: undefined;
  ChatStack: undefined;
  Notifications: undefined;
};

export type RootStackNavigationProp = NavigationProp<RootTabParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends SpotsStackParamList,
        ProfileStackParamList,
        AuthStackParamList,
        ChatStackParamList {}
  }
}

export type SpotStackParamList = {
  SpotsList: undefined;
  SpotDetails: { id: string };
};

export type ProfileStackNavigationProp = NavigationProp<ProfileStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<RootTabParamList>;

// Define the LocationParams type
export type LocationParams = {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  [key: string]: any; // For any additional address components
};
