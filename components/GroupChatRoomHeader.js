import { Entypo, Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function GroupChatRoomHeader({ groupName, groupImage, router, onPress }) {
  return (
    <Stack.Screen
      options={{
        title: '',
        headerShadowVisible: false,
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Entypo name="chevron-left" size={hp(4)} color="#6366F1" />
            </TouchableOpacity>
            {groupImage && (
              <Image
                source={{ uri: groupImage }}
                style={{ width: hp(4.5), height: hp(4.5), borderRadius: hp(2.25), marginLeft: wp(2) }}
              />
            )}
            <TouchableOpacity onPress={onPress}>
              <Text style={{ fontSize: hp(2.5), marginLeft: wp(2) }} className="text-neutral-700 font-medium">
                {groupName}
              </Text>
            </TouchableOpacity>
          </View>
        ),
        headerTitleAlign: 'center',
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="call" size={hp(2.8)} color={'#6366F1'} />
            <Ionicons name="videocam" size={hp(2.8)} color={'#6366F1'} />
          </View>
        ),
      }}
    />
  );
}
