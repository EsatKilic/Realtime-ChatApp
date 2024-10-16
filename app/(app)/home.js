import { View, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ChatList from '../../components/ChatList';
import { getDocs, query, where } from 'firebase/firestore';
import { usersRef } from '../../firebaseConfig';
import HomeButtom from '../../components/HomeButtom'; // HomeButton componentini ekliyoruz

export default function Home() {
    const { logout, user } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (user?.uid)
            getUsers();
    }, []);

    const getUsers = async () => {
        // fetch users
        const q = query(usersRef, where('userId', '!=', user?.uid));
        const querySnapshot = await getDocs(q);
        let data = [];
        querySnapshot.forEach(doc => {
            data.push({ ...doc.data() });
        });
        console.log('got users:', data);
        setUsers(data);
    };

    const handleNewGroup = () => {
        Alert.alert('New Group', 'New Group button pressed!');
    };

    const handleSearch = () => {
        Alert.alert('Search', 'Search button pressed!');
    };
    const handleProfilePress = (userId) => {
      router.push('Profile'); // Profile sayfasına yönlendir
  };
  

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="light" />

            {users.length > 0 ? (
                <ChatList currentUser={user} users={users} />
            ) : (
                <View className="flex items-center" style={{ top: hp(30) }}>
                    <ActivityIndicator size="large" />
                </View>
            )}

            {/* HomeButton Component, sağ alt köşeye ekleniyor */}
            <HomeButtom onNewGroupPress={handleNewGroup} onSearchPress={handleSearch} />
        </View>
    );
}
