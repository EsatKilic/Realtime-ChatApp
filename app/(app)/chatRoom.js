import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Keyboard, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ChatRoomHeader from '../../components/ChatRoomHeader';
import MessageItem from '../../components/MessageItem';
import { useAuth } from '../../context/authContext';
import { db } from '../../firebaseConfig';
import { getRoomId } from '../../utils/common';

export default function ChatRoom() {
    const item = useLocalSearchParams(); 
    const {user} = useAuth(); 
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const scrollViewRef = useRef(null);
    const [keyboardHeight] = useState(new Animated.Value(0));

    useEffect(() => {
        createRoomIfNotExists();

        let roomId = getRoomId(user?.userId, item?.userId);
        const docRef = doc(db, "rooms", roomId);
        const messagesRef = collection(docRef, "messages");
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        let unsub = onSnapshot(q, (snapshot) => {
            let allMessages = snapshot.docs.map(doc => {
                return doc.data();
            });
            setMessages([...allMessages]);
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
            unsub();
            keyboardWillShowSub.remove();
            keyboardWillHideSub.remove();
        }
    }, []);

    useEffect(() => {
        updateScrollView();
    }, [messages])

    const updateScrollView = () => {
        setTimeout(() => {
            scrollViewRef?.current?.scrollToEnd({animated: true})
        }, 100)
    }

    const createRoomIfNotExists = async () => {
        let roomId = getRoomId(user?.userId, item?.userId);
        await setDoc(doc(db, "rooms", roomId), {
           roomId,
           createdAt: Timestamp.fromDate(new Date()) 
        });
    }

    const renderMessage = ({ item }) => (
        <MessageItem message={item} currentUser={user} />
    );

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;
        try {
            let roomId = getRoomId(user?.userId, item?.userId);
            const docRef = doc(db, 'rooms', roomId);
            const messagesRef = collection(docRef, "messages");
            await addDoc(messagesRef, {
                userId: user?.userId,
                text: inputMessage.trim(),
                profileUrl: user?.profileUrl,
                senderName: user?.username,
                createdAt: Timestamp.fromDate(new Date())
            });
            setInputMessage('');
        } catch (err) {
            Alert.alert('Message', err.message);
        }
    }

    return (
        <View style={{flex: 1}}>
            <StatusBar style="dark" />
            <ChatRoomHeader user={item} router={router} />
            <Animated.View style={{ flex: 1, marginBottom: keyboardHeight }}>
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => index.toString()}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    contentContainerStyle={{ paddingTop: 20 }}
                />
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    paddingBottom: Platform.OS === 'ios' ? hp(2.7) : hp(2),
                    paddingTop: 10,
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
                            placeholder='Type message...'
                            placeholderTextColor={'gray'}
                            style={{
                                fontSize: hp(2),
                                paddingVertical: 10,
                            }}
                            onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        />
                    </View>
                    <TouchableOpacity 
                        onPress={handleSendMessage} 
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
    )
}