import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, Keyboard, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GroupChatRoomHeader from '../../components/GroupChatRoomHeader';
import MessageItem from '../../components/MessageItem';
import { useAuth } from '../../context/authContext';
import { db, storage } from '../../firebaseConfig';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GroupChatRoom() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const { groupId, groupName, groupImage } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const { user } = useAuth();
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isGroup, setIsGroup] = useState(false);

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

  const openGroupDetails = () => {
    router.push({
      pathname: '/GroupDetail',
      params: { groupId }
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your gallery.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
    });
    if (!result.canceled) {
      await handleMediaUpload(result.assets[0].uri, 'image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', 
        copyToCacheDirectory: true,
      });
  
      console.log(result); 
  
      if (result.type === 'success') {
        const { uri, name } = result.assets[0]; 
        console.log('Document URI:', uri); 
        await handleMediaUpload(uri, 'document', name); 
      } else if (result.type === 'cancel') {
        Alert.alert('Document Selection Cancelled', 'You cancelled the document selection.');
      } 
     
    } catch (error) {
      Alert.alert('Error', 'Could not pick the document. Please try again.');
      console.error('Document Picker Error:', error); 
    }
  };
  
  
  
  
  

  const handleMediaUpload = async (uri, type, fileName = '') => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      console.log('Fetched Blob:', blob); 
  
      const timestamp = new Date().getTime();
      const path = `chat/${groupId}/${timestamp}_${fileName}`; 
      const storageRef = ref(storage, path);
      
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log('Upload Result:', uploadResult); 
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        userId: user?.userId,
        type: type,
        mediaUrl: downloadURL,
        fileName: fileName || `${timestamp}.docx`,
        profileUrl: user?.profileUrl,
        senderName: user?.username,
        createdAt: Timestamp.fromDate(new Date())
      });
  
      Alert.alert('Success', 'Document successfully sent!'); 
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document: ' + error.message);
      console.error('Upload Error:', error); 
    }
  };
  

  const renderMessage = ({ item }) => (
    <MessageItem message={item} currentUser={user} isGroup={isGroup} />
  );

  return (
    <View style={{ flex: 1 }}>
<GroupChatRoomHeader 
  groupName={groupName} 
  groupImage={groupImage} 
  router={router} 
  onPress={openGroupDetails} 
/>
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
          <TouchableOpacity onPress={pickImage} style={{ padding: 10 }}>
            <Ionicons name="image" size={30} color="#6366F1" />
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
