import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatInboxScreen } from '@/screens/Chat/ChatInboxScreen';
import { ChatRoomScreen } from '@/screens/Chat/ChatRoomScreen';

const Stack = createNativeStackNavigator();

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
                options={({ route }: any) => ({ title: route.params?.title || 'Chat' })} 
            />
        </Stack.Navigator>
    );
};