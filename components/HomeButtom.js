import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import CreateGroup from './CreateGroup';

const HomeButtom = ({ onSearchPress }) => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const router = useRouter();

  const handleGroupCreated = (groupId, groupName, selectedUsers) => {
    setIsCreatingGroup(false);
    router.push({
      pathname: '/GroupChatRoom',
      params: { 
        groupId, 
        groupName, 
        members: JSON.stringify(selectedUsers) 
      }
    });
  };

  const toggleCreateGroup = () => {
    setIsCreatingGroup(prevState => !prevState);
  };

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: wp(5),
          paddingVertical: hp(2),
          backgroundColor: '#6366F1',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <TouchableOpacity onPress={onSearchPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="search" size={hp(3)} color="white" />
          <Text style={{ color: 'white', marginLeft: 5, fontSize: hp(2.2) }}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleCreateGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign name="addusergroup" size={hp(3)} color="white" />
          <Text style={{ color: 'white', marginLeft: 5, fontSize: hp(2.2) }}>New Group</Text>
        </TouchableOpacity>
      </View>

      {isCreatingGroup && (
        <View style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 5,
          padding: 20,
        }}>
          <CreateGroup onGroupCreated={handleGroupCreated} />
        </View>
      )}
    </View>
  );
};

export default HomeButtom;