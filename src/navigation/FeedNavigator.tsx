import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedScreen } from '@/screens/Feed/FeedScreen';
import { SpotDetailsScreen } from '@/screens/Spots/SpotDetailsScreen';
import { UserProfileScreen } from '@/screens/Profile/UserProfileScreen';

const Stack = createNativeStackNavigator();

export const FeedNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="FeedMain" 
                component={FeedScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="SpotDetails" 
                component={SpotDetailsScreen} 
                options={{ title: 'Spot Details' }} 
            />
            <Stack.Screen 
                name="UserProfile" 
                component={UserProfileScreen} 
                options={{ title: 'Profile' }} 
            />
        </Stack.Navigator>
    );
};