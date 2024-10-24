import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function MessageItem({ message, currentUser, isGroup }) {
  const isOwnMessage = message.userId === currentUser.userId;

  const handleMediaPress = async () => {
    if (message.mediaUrl) {
      try {
        const supported = await Linking.canOpenURL(message.mediaUrl);
        if (supported) {
          await Linking.openURL(message.mediaUrl);
        } else {
          Alert.alert('Error', 'This file type cannot be opened.');
        }
      } catch (error) {
        console.error('File opening error:', error);
        Alert.alert('Error', 'An error occurred while opening the file.');
      }
    }
  };

  const renderContent = () => {
    if (message.type === 'image') {
      return (
        <TouchableOpacity onPress={handleMediaPress}>
          <Image
            source={{ uri: message.mediaUrl }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    } else if (message.type === 'document') {
      return (
        <TouchableOpacity 
          onPress={handleMediaPress}
          style={styles.documentContainer}
        >
          <View style={styles.documentIconContainer}>
            <Ionicons name="document-text" size={24} color="#6366F1" />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName} numberOfLines={1}>
              {message.fileName || 'Belge'}
            </Text>
            <Text style={styles.documentSize}>
              {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ''}
            </Text>
          </View>
          <Ionicons name="download-outline" size={20} color="#6366F1" />
        </TouchableOpacity>
      );
    } else {
      return <Text style={styles.messageText}>{message.text}</Text>;
    }
  };

  return (
    <View style={[
      styles.messageContainer,
      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {isGroup && !isOwnMessage && (
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: message.profileUrl || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
        </View>
      )}
      <View style={styles.messageContent}>
        {isGroup && !isOwnMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          message.type !== 'text' && styles.mediaBubble
        ]}>
          {renderContent()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: hp(0.5),
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingBottom: 8,
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    marginRight: 'auto',
  },
  messageContent: {
    flexShrink: 1,
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
  },
  ownMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: hp(1.8),
    color: '#000000',
  },
  senderName: {
    fontSize: hp(1.6),
    color: '#888888',
    marginBottom: hp(0.2),
  },
  profileImageContainer: {
    marginRight: wp(2),
    alignSelf: 'flex-end',
  },
  profileImage: {
    width: hp(4),
    height: hp(4),
    borderRadius: hp(2),
  },
  mediaImage: {
    width: wp(50),
    height: wp(50),
    borderRadius: 10,
  },
   documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    maxWidth: wp(70),
    minWidth: wp(50),
  },
  documentIconContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  documentName: {
    fontSize: hp(1.6),
    color: '#1F2937',
    fontWeight: '500',
  },
  documentSize: {
    fontSize: hp(1.4),
    color: '#6B7280',
    marginTop: 2,
  },
  mediaImage: {
    width: wp(50),
    height: wp(50),
    borderRadius: 10,
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
  },
  mediaBubble: {
    backgroundColor: 'white',
    padding: 5,
    overflow: 'hidden',
  },
  documentText: {
    marginLeft: 10,
    fontSize: hp(1.8),
    color: '#0066CC',
    textDecorationLine: 'underline',
  },
  mediaBubble: {
    padding: 5,
    overflow: 'hidden',
  },
});
