import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { blurhash, formatDate, getRoomId } from '../utils/common';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ChatItem({item, router, noBorder, currentUser}) {

    const [lastMessage, setLastMessage] = useState(undefined);
    useEffect(()=>{

        let roomId = getRoomId(currentUser?.userId, item?.userId);
        const docRef = doc(db, "rooms", roomId);
        const messagesRef = collection(docRef, "messages");
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        let unsub = onSnapshot(q, (snapshot)=>{
            let allMessages = snapshot.docs.map(doc=>{
                return doc.data();
            });
            setLastMessage(allMessages[0]? allMessages[0]: null);
        });

        return unsub;
    },[]);

    // console.log('last message: ', lastMessage);

    const openChatRoom = ()=>{
        router.push({pathname: '/chatRoom', params: item});
    }

    const renderTime = ()=>{
        if(lastMessage){
            let date = lastMessage?.createdAt;
            return formatDate(new Date(date?.seconds * 1000));
        }
    }

    const renderLastMessage = ()=>{
        if(typeof lastMessage == 'undefined') return 'Loading...';
        if(lastMessage){
            if(currentUser?.userId == lastMessage?.userId) return "You: "+lastMessage?.text;
            return lastMessage?.text;
        }else{
            return 'Say Hi 👋';
        }
    }
  return (
    <TouchableOpacity 
    onPress={openChatRoom} 
    style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, paddingBottom: 8, borderBottomWidth: noBorder ? 0 : 1, borderBottomColor: '#D1D5DB' }} // border color: neutral-200
>
    <Image
        style={{ height: hp(6), width: hp(6), borderRadius: 100, marginRight: 10 }} // Resim sağındaki boşluk
        source={item?.profileUrl}
        placeholder={blurhash}
        transition={500}
    />

    {/* name and last message */}
    <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: hp(1.8), fontWeight: '600', color: '#1F2937' }}> {/* text-neutral-800 */}
                {item?.username}
            </Text>
            <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6B7280' }}> {/* text-neutral-500 */}
                {renderTime()}
            </Text>
        </View>
        <Text style={{ fontSize: hp(1.6), fontWeight: '500', color: '#6B7280' }}> {/* text-neutral-500 */}
            {renderLastMessage()}
        </Text>
    </View>
</TouchableOpacity>

  )
}