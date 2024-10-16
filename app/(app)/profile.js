import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, Button } from 'react-native';
import { useAuth } from '../../context/authContext';
import { db } from '../../firebaseConfig';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';

const Profile = () => {
    const { user } = useAuth();
    const [profileUrl, setProfileUrl] = useState(user.profileUrl || 'https://via.placeholder.com/150');
    const router = useRouter();
    const auth = getAuth();

    const handleBack = () => {
        router.push('home');
    };

    const updateProfilePicture = async () => {
        if (!profileUrl) {
            Alert.alert("Error", "Please enter a valid URL.");
            return;
        }

        try {
            const userRef = doc(db, "users", user.userId); // Firestore'daki kullanıcı referansı
            await updateDoc(userRef, {
                profileUrl: profileUrl
            });
            Alert.alert("Success", "Profile picture updated successfully!");
        } catch (error) {
            Alert.alert("Error", "Could not update profile picture.");
        }
    };

    const deleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            const userRef = doc(db, "users", user.userId); // Firestore'daki kullanıcı referansı
                            await deleteDoc(userRef); // Kullanıcı verilerini sil
                            await signOut(auth); // Kullanıcıyı çıkış yaptır
                            Alert.alert("Success", "Your account has been deleted.");
                            router.push('/signIn'); // Giriş ekranına yönlendirme
                        } catch (error) {
                            Alert.alert("Error", "Could not delete your account.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleBack} style={{ marginBottom: 20, position: 'absolute', top: 40, left: 16 }}>
                <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Image
                source={{ uri: profileUrl }} 
                style={{ width: 150, height: 150, borderRadius: 75, marginVertical: 10 }}
            />
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                {user.username || 'Username not available'}
            </Text>
            <Text style={{ fontSize: 16, textAlign: 'center' }}>
                {user.email || 'Email not available'}
            </Text>

            {/* Profil resmi URL'sini değiştirmek için input */}
            <TextInput
                value={profileUrl}
                onChangeText={setProfileUrl}
                placeholder="Enter new profile image URL"
                style={{
                    borderWidth: 1,
                    borderColor: 'gray',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    marginTop: 20,
                    width: '100%',
                }}
            />
            <Button title="Update Profile Picture" onPress={updateProfilePicture} />

            {/* Hesabı silmek için buton */}
            <TouchableOpacity onPress={deleteAccount} style={{ marginTop: 20 }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Profile;
