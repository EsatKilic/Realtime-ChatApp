import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import MessageItem from './MessageItem';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function MessageList({ messages, currentUser, isGroup }) {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <MessageItem
          message={item}
          currentUser={currentUser}
          isGroup={isGroup}
        />
      )}
      contentContainerStyle={styles.listContainer}
      inverted
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
});