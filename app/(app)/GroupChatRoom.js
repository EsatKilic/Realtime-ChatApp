import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import GroupChatRoomHeader from '../../components/GroupChatRoomHeader';
import MessageItem from '../../components/MessageItem';
import { Ionicons } from '@expo/vector-icons';

export default function GroupChatRoom() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const { groupId, groupName, groupImage } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'groups', groupId, 'messages'), orderBy('createdAt', 'asc')); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim().length > 0) {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        text: inputMessage.trim(),
        createdAt: new Date(),
        userId: 'currentUserId', 
        username: 'Current User', 
        userProfileUrl: 'currentUser.profileUrl', 
      });
      setInputMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <MessageItem message={item} currentUser={{ userId: 'currentUserId' }} isGroup={true} />
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <GroupChatRoomHeader groupName={groupName} groupImage={groupImage} router={router} />
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
      <View style={{ flexDirection: 'row', padding: 10, marginBottom: Platform.OS === 'ios' ? 20 : 0 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: 'gray', borderRadius: 20, paddingHorizontal: 10, marginRight: 10 }}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={24} color="blue" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
