import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatInboxScreen } from '@/screens/Chat/ChatInboxScreen';
import { ChatRoomScreen } from '@/screens/Chat/ChatRoomScreen';
import { CreateGroupScreen } from '@/screens/Chat/CreateGroupScreen';
import { ChatSettingsScreen } from '@/screens/Chat/ChatSettingsScreen';
import { ChatStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export const ChatNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="ChatInbox" 
                component={ChatInboxScreen} 
                options={{ title: 'Messages' }} 
            />
            <Stack.Screen 
                name="ChatRoom" 
                component={ChatRoomScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="CreateGroup" 
                component={CreateGroupScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="ChatSettings" 
                component={ChatSettingsScreen} 
                options={{ headerShown: false }} 
            />
        </Stack.Navigator>
    );
};
