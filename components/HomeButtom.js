import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function HomeButton({ onNewGroupPress, onSearchPress }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: '#6366F1', // indigo-500
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: 'absolute',
        bottom: 0,
        width: '100%',
      }}
    >
      {/* Search Button */}
      <TouchableOpacity onPress={onSearchPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Feather name="search" size={hp(3)} color="white" />
        <Text style={{ color: 'white', marginLeft: 5, fontSize: hp(2.2) }}>Search</Text>
      </TouchableOpacity>

      {/* New Group Button */}
      <TouchableOpacity onPress={onNewGroupPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AntDesign name="addusergroup" size={hp(3)} color="white" />
        <Text style={{ color: 'white', marginLeft: 5, fontSize: hp(2.2) }}>New Group</Text>
      </TouchableOpacity>
    </View>
  );
}
