import { View, Text } from 'react-native'
import React from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function MessageItem({message, currentUser}) {
  if(currentUser?.userId==message?.userId){
    // my message
    return (
       <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, marginRight: 10 }}>
    <View style={{ width: wp(80) }}>
        <View style={{ alignSelf: 'flex-end', padding: 10, borderRadius: 20, backgroundColor: 'white', borderColor: '#e5e7eb', borderWidth: 1 }}>
            <Text style={{ fontSize: hp(1.9) }}>
                {message?.text}
            </Text>
        </View>
    </View>
</View>
    )
  }else{
    return (
        <View style={{width: wp(80)}} className="ml-3 mb-3">
            <View className="flex self-start p-3 px-4 rounded-2xl bg-indigo-100 border border-indigo-200">
                <Text style={{fontSize: hp(1.9)}}>
                    {message?.text}
                </Text>
            </View>
        </View>
    )
  }
}