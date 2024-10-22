import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Keyboard, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GroupChatRoomHeader from '../../components/GroupChatRoomHeader';
import MessageItem from '../../components/MessageItem';
import { useAuth } from '../../context/authContext';
import { db } from '../../firebaseConfig';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GroupChatRoom() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const { groupId, groupName, groupImage } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const { user } = useAuth();
  const [keyboardHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    const q = query(collection(db, 'groups', groupId, 'messages'), orderBy('createdAt', 'asc')); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    });

    const keyboardWillShow = (event) => {
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: event.endCoordinates.height,
        useNativeDriver: false,
      }).start();
    };

    const keyboardWillHide = (event) => {
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    };

    const keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    const keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

    return () => {
      unsubscribe();
      keyboardWillShowSub.remove();
      keyboardWillHideSub.remove();
    };
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
        userId: user.userId, 
        username: user.username, 
        userProfileUrl: user.profileUrl, 
      });
      setInputMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <MessageItem message={item} currentUser={user} isGroup={true} />
  );

  return (
    <View style={{ flex: 1 }}>
      <GroupChatRoomHeader groupName={groupName} groupImage={groupImage} router={router} />
      <Animated.View style={{ flex: 1, marginBottom: keyboardHeight }}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? hp(2.7) : hp(2), 
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
        }}>
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 25,
            borderWidth: 1,
            borderColor: '#E5E5E5',
            marginRight: 10,
            paddingHorizontal: 15,
          }}>
            <TextInput 
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Type a message..."
              placeholderTextColor={'gray'}
              style={{
                fontSize: hp(2),
                paddingVertical: 10,
              }}
              onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            />
          </View>
          <TouchableOpacity 
            onPress={sendMessage} 
            style={{
              backgroundColor: 'blue',
              borderRadius: 25,
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}