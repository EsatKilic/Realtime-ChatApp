import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function MessageItem({ message, currentUser, isGroup }) {
  const isOwnMessage = message.userId === currentUser.userId;

 

  return (
    <View style={styles.outerContainer}>
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
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
          ]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'flex-end',
  },
  messageContainer: {
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: hp(0.5),
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
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
});