import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { db } from '../firebaseConfig';
import ChatItem from './ChatItem';

export default function ChatList({ users, currentUser }) {
    const router = useRouter();
    const [allChats, setAllChats] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        const initialChats = users.map(user => ({ ...user, isGroup: false }));
        setAllChats(initialChats); 

        const groupsRef = collection(db, 'groups');
        const groupQuery = query(groupsRef, where('members', 'array-contains', currentUser.userId));
        
        const unsubscribeGroups = onSnapshot(groupQuery, (snapshot) => {
            const groupList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isGroup: true 
            }));
            
            setAllChats(prevChats => [
                ...prevChats.filter(chat => !chat.isGroup), 
                ...groupList 
            ]);
        });

        return () => unsubscribeGroups();
    }, [users, currentUser.userId]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term === '') {
            setFilteredUsers(allChats); 
        } else {
            const filtered = allChats.filter(chat => {
                if (!chat.isGroup) { 
                    return chat.username?.toLowerCase().includes(term.toLowerCase());
                } else { 
                    return chat.name?.toLowerCase().includes(term.toLowerCase()); 
                }
            });
           
            setFilteredUsers(filtered);
        }
    };

    return (
        <FlatList
            data={filteredUsers.length > 0 ? filteredUsers : allChats} 
            contentContainerStyle={{ paddingBottom: hp(10) }}
            style={{ flex: 1 }}
            keyExtractor={item => item.isGroup ? `group-${item.id}` : `chat-${item.userId}`}
            renderItem={({ item, index }) => 
                <ChatItem 
                    noBorder={index + 1 === filteredUsers.length} 
                    router={router} 
                    currentUser={currentUser}
                    item={item} 
                    index={index} 
                    isGroup={item.isGroup}
                />
            }
        />
    );
}
