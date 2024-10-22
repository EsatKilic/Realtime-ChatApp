import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TextInput, View } from 'react-native';
import ChatList from '../../components/ChatList';
import HomeButtom from '../../components/HomeButtom';
import { useAuth } from '../../context/authContext';
import { usersRef } from '../../firebaseConfig';

export default function Home() {
    const { user, isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [allChats, setAllChats] = useState([]); 

    const getUsers = useCallback(async () => {
        
        if (!user?.userId) return;
        setLoading(true);
        setError(null);
        try {
            const q = query(usersRef, where('userId', '!=', user.userId));
            const querySnapshot = await getDocs(q);
            let data = [];
            querySnapshot.forEach(doc => {
                data.push({ ...doc.data() });
            });
            setUsers(data);
            setFilteredUsers(data); 
            setAllChats(data); 
        } catch (err) {
            
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.userId]);

    const handleSearch = (term) => {
       
        setSearchTerm(term);
        if (term === '') {
            setFilteredUsers(allChats); 
        } else {
            const filtered = allChats.filter(chat => {
                if (!chat.isGroup) { 
                    return chat.username?.toLowerCase().includes(term.toLowerCase());
                }
                
                return false; 
            });
            
            setFilteredUsers(filtered);
        }
    };
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && user?.userId) {
                getUsers();
            }
        }, [isAuthenticated, user, getUsers])
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <StatusBar style="light" />
            <View style={{ flex: 1 }}>
                {isSearching && (
                    <TextInput
                        value={searchTerm}
                        onChangeText={handleSearch}
                        placeholder="Search users..."
                        style={{ padding: 10, borderColor: 'gray', borderWidth: 1, margin: 10 }}
                    />
                )}
                {filteredUsers.length > 0 ? (
                    <ChatList currentUser={user} users={filteredUsers} />
                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>No users found</Text>
                )}
                <HomeButtom onSearchPress={() => setIsSearching(prev => !prev)} />
            </View>
        </SafeAreaView>
    );
}
