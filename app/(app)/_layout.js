// (app)/_layout.js
import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
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
                name="settings" // Settings ekranı adı
                options={{
                    headerShown: false, // Varsayılan başlık göstermemek için
                }}
            />
            <Stack.Screen 
            name="GroupChatRoom" 
            options={{ title: 'Group Chat' }}
             />
        </Stack>
    );
}
