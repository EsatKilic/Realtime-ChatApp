import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Keyboard, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ChatRoomHeader from '../../components/ChatRoomHeader';
import MessageItem from '../../components/MessageItem';
import { useAuth } from '../../context/authContext';
import { db, storage } from '../../firebaseConfig';
import { getRoomId } from '../../utils/common';

export default function ChatRoom() {
    const item = useLocalSearchParams(); 
    const {user} = useAuth(); 
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const scrollViewRef = useRef(null);
    const [keyboardHeight] = useState(new Animated.Value(0));
    const [isGroup, setIsGroup] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

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
        if (messages.length > 0) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const createRoomIfNotExists = async () => {
        let roomId = getRoomId(user?.userId, item?.userId);
        await setDoc(doc(db, "rooms", roomId), {
           roomId,
           createdAt: Timestamp.fromDate(new Date()) 
        });
    }

    const renderMessage = ({ item }) => (
        <MessageItem 
            message={item} 
            currentUser={user} 
            isGroup={false}
        />
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
                type: 'text',
                profileUrl: user?.profileUrl,
                senderName: user?.username,
                createdAt: Timestamp.fromDate(new Date())
            });
            setInputMessage('');
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    }

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant gallery access permission.');
                return;
            }
    
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5,
                allowsEditing: true,
            });
    
            if (!result.canceled && result.assets && result.assets[0]) {
                await handleMediaUpload(result.assets[0].uri, 'image', 'image.jpg');
            }
        } catch (error) {
            console.error("Image selection error:", error);
            Alert.alert("Error", "An error occurred while selecting the image: " + error.message);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true
            });
            
            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                
                if (asset.size > 10 * 1024 * 1024) { 
                    Alert.alert('Error', 'File size must be less than 10MB.');
                    return;
                }
                
                await handleMediaUpload(asset.uri, 'document', asset.name);
            }
        } catch (error) {
            console.error('Image selection error:', error);
            Alert.alert('Error', 'Document could not be selected: ' + error.message);
        }
    };

    const handleMediaUpload = async (uri, type, fileName = '') => {
        setIsUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const roomId = getRoomId(user?.userId, item?.userId);
            const timestamp = new Date().getTime();
            const fileExtension = fileName.split('.').pop() || (type === 'image' ? 'jpg' : 'file');
            const path = `chat/${roomId}/${timestamp}_${type}.${fileExtension}`;

            const storageRef = ref(storage, path);
            const uploadResult = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            const docRef = doc(db, 'rooms', roomId);
            const messagesRef = collection(docRef, "messages");
            
            await addDoc(messagesRef, {
                userId: user?.userId,
                type: type,
                mediaUrl: downloadURL,
                fileName: fileName || `${timestamp}.${fileExtension}`,
                fileSize: blob.size,
                mimeType: blob.type,
                profileUrl: user?.profileUrl,
                senderName: user?.username,
                createdAt: Timestamp.fromDate(new Date())
            });

        } catch (error) {
            console.error("Media upload error:", error);
            Alert.alert("Error", "An error occurred while uploading the file: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

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
                    <TouchableOpacity 
                        onPress={pickImage} 
                        style={{ padding: 10 }}
                        disabled={isUploading}
                    >
                        <Ionicons name="image" size={30} color={isUploading ? '#A0A0A0' : '#6366F1'} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={pickDocument} 
                        style={{ padding: 10 }}
                        disabled={isUploading}
                    >
                        <Ionicons name="document" size={30} color={isUploading ? '#A0A0A0' : '#6366F1'} />
                    </TouchableOpacity>

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
                            placeholder="Write a message..."
                            placeholderTextColor={'gray'}
                            style={{
                                fontSize: hp(2),
                                paddingVertical: 10,
                            }}
                            editable={!isUploading}
                        />
                    </View>
                    <TouchableOpacity 
    onPress={handleSendMessage}
    style={{
        backgroundColor: '#6366F1',
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