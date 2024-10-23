import { collection, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { db } from '../firebaseConfig';
import { blurhash, formatDate, getRoomId } from '../utils/common';

export default function ChatItem({ item, router, noBorder, currentUser, isGroup }) {
  const [lastMessage, setLastMessage] = useState(undefined);
  
  useEffect(() => {
    let roomId = isGroup ? item.id : getRoomId(currentUser?.userId, item?.userId);
    const docRef = doc(db, isGroup ? "groups" : "rooms", roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
  
    let unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lastMessageData = snapshot.docs[0].data();
        setLastMessage(lastMessageData);
      } else {
        setLastMessage(null);
      }
    }, (error) => {
      console.error("Error fetching last message:", error);
    });
  
    return unsub;
  }, [isGroup, item.id, currentUser?.userId, item?.userId]);
  const openChatRoom = () => {
    if (isGroup) {
      router.push({
        pathname: '/GroupChatRoom',
        params: { 
          groupId: item.id, 
          groupName: item.name,
          groupImage: item.groupImage
        }
      });
    } else {
      router.push({ pathname: '/chatRoom', params: item });
    }
  };

  const renderTime = () => {
    if (lastMessage) {
      let date = lastMessage?.createdAt;
      return formatDate(new Date(date?.seconds * 1000));
    }
  };

  const renderLastMessage = () => {
    if (typeof lastMessage == 'undefined') return 'Loading...';
    if (lastMessage) {
      const lastMessageUserId = lastMessage.userId;
      
      if (lastMessage.type === 'image') {
        return currentUser?.userId === lastMessageUserId 
          ? "You: Image" 
          : isGroup 
            ? `${lastMessage.username}: Image` 
            : "Image";
      }

      if (currentUser?.userId === lastMessageUserId) {
        return "You: " + lastMessage.text;
      } else {
        return isGroup ? `${lastMessage.username}: ${lastMessage.text}` : lastMessage.text;
      }
    } else {
      return 'Say Hi 👋';
    }
  };

  const defaultImageUrl = 'https://via.placeholder.com/150';

  const getImageUrl = () => {
    if (isGroup) {
      return item.groupImage || defaultImageUrl;
    } else {
      return item.profileUrl || defaultImageUrl;
    }
  };

  return (
    <TouchableOpacity 
      onPress={openChatRoom} 
      style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, paddingBottom: 8, borderBottomWidth: noBorder ? 0 : 1, borderBottomColor: '#D1D5DB' }}
    >
      <Image
        style={{ height: hp(6), width: hp(6), borderRadius: 100, marginRight: 10 }}
        source={{ uri: getImageUrl() }}
        placeholder={blurhash}
        transition={500}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: hp(1.8), fontWeight: '600', color: '#1F2937' }}>
            {isGroup ? item.name : item.username}
          </Text>
          <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6B7280' }}>
            {renderTime()}
          </Text>
        </View>
        <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6B7280' }}>
          {renderLastMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
