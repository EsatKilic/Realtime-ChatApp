import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/authContext';
import { db } from '../../firebaseConfig';

const Profile = () => {
    const { user, updateUser } = useAuth(); 
    const [profileUrl, setProfileUrl] = useState(user?.profileUrl || 'https://via.placeholder.com/150');
    const [newProfileUrl, setNewProfileUrl] = useState('');
    const [password, setPassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const router = useRouter();
    const auth = getAuth();

    useEffect(() => {
        if (user?.userId) {
            const userRef = doc(db, "users", user.userId);
            const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    setProfileUrl(userData.profileUrl);
                    if (typeof updateUser === 'function') {
                        updateUser(userData);
                    }
                }
            });

            return () => unsubscribe();
        }
    }, [user?.userId, updateUser]);

    const handleBack = () => {
        router.back();
    };

    const updateProfilePicture = async () => {
        if (!newProfileUrl) {
            Alert.alert("Error", "Please enter a valid URL.");
            return;
        }

        try {
            const userRef = doc(db, "users", user.userId);
            await updateDoc(userRef, {
                profileUrl: newProfileUrl
            });
            setNewProfileUrl('');
            Alert.alert("Success", "Profile picture updated successfully!");
        } catch (error) {
            
            Alert.alert("Error", "Could not update profile picture. Please try again.");
        }
    };

    const initiateDeleteAccount = () => {
        setShowDeleteConfirm(true);
    };

    const deleteAccount = async () => {
        if (!password) {
            Alert.alert("Error", "Please enter your password to confirm account deletion.");
            return;
        }

        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            const currentUser = auth.currentUser;
                            if (!currentUser) {
                                throw new Error("No authenticated user found");
                            }

                            const credential = EmailAuthProvider.credential(currentUser.email, password);
                            await reauthenticateWithCredential(currentUser, credential);

                            const userRef = doc(db, "users", user.userId);
                            await deleteDoc(userRef);

                            await deleteUser(currentUser);

                            await signOut(auth);


                            Alert.alert("Success", "Your account has been deleted.");
                            
                            router.replace('/signIn');
                        } catch (error) {
                            let errorMessage = "Could not delete your account. ";
                            if (error.code === 'auth/wrong-password') {
                                errorMessage = "Incorrect password. Please try again.";
                            } else if (error.code === 'auth/too-many-requests') {
                                errorMessage = "Too many unsuccessful attempts. Please try again later.";
                            } else {
                                errorMessage += error.message || "Please try again later.";
                            }
                            Alert.alert("Error", errorMessage);
                        } finally {
                            setPassword(''); 
                            setShowDeleteConfirm(false); 
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image
                    source={{ uri: profileUrl, cache: 'reload' }}
                    style={styles.profileImage}
                />
                <Text style={styles.username}>{user?.username}</Text>
                <Text style={styles.email}>{user?.email}</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        value={newProfileUrl}
                        onChangeText={setNewProfileUrl}
                        placeholder="Enter new profile image URL"
                        style={styles.input}
                    />
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={updateProfilePicture}
                    >
                        <Text style={styles.updateButtonText}>Update Profile Picture</Text>
                    </TouchableOpacity>
                </View>

                {!showDeleteConfirm ? (
                    <TouchableOpacity onPress={initiateDeleteAccount} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>Delete Account</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.deleteConfirmContainer}>
                        <Text style={styles.deleteConfirmText}>
                            Please enter your password to confirm account deletion:
                        </Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                            style={styles.input}
                        />
                        <Button
                            title="Confirm Delete Account"
                            onPress={deleteAccount}
                            color="red"
                            disabled={!password}
                        />
                        <TouchableOpacity onPress={() => {
                            setShowDeleteConfirm(false);
                            setPassword('');
                        }} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );

};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        zIndex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 80,
        alignItems: 'center',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    email: {
        fontSize: 18,
        marginBottom: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
        width: '100%',
    },
    updateButton: {
        backgroundColor: '#6366F1',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    updateButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    deleteButton: {
        marginTop: 20,
    },
    deleteButtonText: {
        color: 'red',
        fontWeight: 'bold',
    },
    deleteConfirmContainer: {
        width: '100%',
        marginTop: 20,
    },
    deleteConfirmText: {
        textAlign: 'center',
        marginBottom: 10,
    },
    cancelButton: {
        marginTop: 10,
    },
    cancelButtonText: {
        color: 'blue',
        textAlign: 'center',
    },
});
export default Profile;