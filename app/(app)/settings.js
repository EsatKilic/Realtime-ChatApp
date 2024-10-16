// Settings.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const Settings = () => {
    const router = useRouter();

    const handleBack = () => {
      router.push('home');
    };

    return (
        <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity onPress={handleBack} style={{ position: 'absolute', top: 40, left: 20 }}>
                <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                You use Realtime Chat App by MEK production.
               
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                
                Thank you for choosing us !
            </Text>
        </View>
    );
};

export default Settings;
