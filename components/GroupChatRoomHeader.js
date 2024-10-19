import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function GroupChatRoomHeader({ groupName, groupImage, router }) {
  return (
    <Stack.Screen
      options={{
        title: '',
        headerShadowVisible: false,
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Entypo name="chevron-left" size={hp(4)} color="#737373" />
            </TouchableOpacity>
            {groupImage && (
              <Image
                source={{ uri: groupImage }}
                style={{ width: hp(4.5), height: hp(4.5), borderRadius: hp(2.25), marginLeft: wp(2) }}
              />
            )}
            <Text style={{ fontSize: hp(2.5), marginLeft: wp(2) }} className="text-neutral-700 font-medium">
              {groupName}
            </Text>
          </View>
        ),
        headerTitleAlign: 'center',
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="call" size={hp(2.8)} color={'#737373'} />
            <Ionicons name="videocam" size={hp(2.8)} color={'#737373'} />
          </View>
        ),
      }}
    />
  );
}
