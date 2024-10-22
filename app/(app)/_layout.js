// (app)/_layout.js
import { Stack } from 'expo-router';
import React from 'react';
import HomeHeader from '../../components/HomeHeader';

export default function _layout() {
    return (
        <Stack>
            <Stack.Screen
                name="home"
                options={{
                    header: () => <HomeHeader />,
                }}
            />
            <Stack.Screen
                name="profile"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="settings" 
                options={{
                    headerShown: false, 
                }}
            />
            <Stack.Screen 
            name="GroupChatRoom" 
            options={{ title: 'Group Chat' }}
             />
        </Stack>
    );
}
