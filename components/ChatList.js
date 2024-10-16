import { View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import ChatItem from './ChatItem'
import { useRouter } from 'expo-router'
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ChatList({users, currentUser}) {
    const router = useRouter();
    const [allChats, setAllChats] = useState([]);

    useEffect(() => {
        // Mevcut bireysel sohbetleri ekle
        setAllChats(users.map(user => ({...user, isGroup: false})));

        // Grup sohbetlerini al ve ekle
        const groupsRef = collection(db, 'groups');
        const unsubscribeGroups = onSnapshot(groupsRef, (snapshot) => {
            const groupList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isGroup: true
            }));
            setAllChats(prevChats => [...prevChats.filter(chat => !chat.isGroup), ...groupList]);
        });

        return () => unsubscribeGroups();
    }, [users]);

    return (
        <View style={{flex: 1}}>
            <FlatList
                data={allChats}
                contentContainerStyle={{paddingVertical: 25}}
                style={{flex: 1}}
                keyExtractor={item=> item.isGroup ? `group-${item.id}` : `chat-${item.userId}`}
                renderItem={({item, index}) => 
                    <ChatItem 
                        noBorder={index+1 == allChats.length} 
                        router={router} 
                        currentUser={currentUser}
                        item={item} 
                        index={index} 
                        isGroup={item.isGroup}
                    />
                }
            />
        </View>
    )
}