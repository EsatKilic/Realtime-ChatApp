import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function MessageItem({ message, currentUser, isGroup }) {
  const isOwnMessage = message.userId === currentUser.userId;

  const handleMediaPress = () => {
    if (message.mediaUrl) {
      Linking.openURL(message.mediaUrl);
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
            source={{ uri: message.userProfileUrl || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
        </View>
      )}
      <View style={styles.messageContent}>
        {isGroup && !isOwnMessage && (
          <Text style={styles.senderName}>{message.username}</Text>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          message.type === 'image' && styles.mediaBubble
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
  // Medya için stiller
  mediaImage: {
    width: wp(50),
    height: wp(50),
    borderRadius: 10,
  },
  mediaBubble: {
    padding: 2,
    overflow: 'hidden',
  },
});
