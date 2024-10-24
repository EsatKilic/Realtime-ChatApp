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
const [isGroup, setIsGroup] = useState(true);
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

  

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Lütfen galeriye erişim izni verin.');
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
      console.error('Resim seçme hatası:', error);
      Alert.alert('Hata', 'Resim seçilemedi: ' + error.message);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      console.log('Document Pick Result:', result);
  
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Selected Document:', asset);
  
        try {
          const downloadURL = await handleMediaUpload(
            asset.uri,
            'document',
            asset.name
          );
          console.log('Document uploaded successfully:', downloadURL);
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
          Alert.alert('Hata', 'Belge yüklenemedi: ' + uploadError.message);
        }
      }
    } catch (err) {
      console.error('Belge seçme hatası:', err);
      Alert.alert('Hata', 'Belge seçilemedi: ' + err.message);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        await addDoc(collection(db, 'groups', groupId, 'messages'), {
          userId: user?.userId,
          text: inputMessage.trim(),
          type: 'text',
          profileUrl: user?.profileUrl,
          senderName: user?.username,
          createdAt: Timestamp.fromDate(new Date())
        });
        setInputMessage('');
      } catch (error) {
        console.error("Mesaj gönderimi sırasında hata: ", error);
        Alert.alert("Hata", "Mesaj gönderilemedi: " + error.message);
      }
    }
  };

  const openGroupDetails = () => {
    router.push({
      pathname: '/GroupDetail',
      params: { groupId }
    });
  };

  const handleMediaUpload = async (uri, type, fileName = '') => {
    try {
      console.log('Starting media upload:', { uri, type, fileName });
  
      const response = await fetch(uri);
      if (!response.ok) throw new Error('Dosya alınamadı');
      
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size);
  
      const timestamp = new Date().getTime();
      const fileExtension = fileName.split('.').pop() || 'file';
      const path = `chat/${groupId}/${timestamp}_${fileName}`;
      console.log('Storage path:', path);
  
      const storageRef = ref(storage, path);
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log('Upload completed');
  
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL obtained:', downloadURL);
  
      // Firestore'a mesaj ekleme
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        userId: user?.userId,
        type: type,
        mediaUrl: downloadURL,
        fileName: fileName,
        fileSize: blob.size,
        mimeType: type === 'document' ? blob.type : null,
        profileUrl: user?.profileUrl,
        senderName: user?.username,
        createdAt: Timestamp.fromDate(new Date())
      });
  
      console.log('Message added to Firestore');
      return downloadURL;
    } catch (error) {
      console.error('Upload Error:', error);
      throw new Error('Dosya yüklenemedi: ' + error.message);
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

          <TouchableOpacity onPress={pickDocument} style={{ padding: 10 }}>
            <Ionicons name="document" size={30} color="#6366F1" />
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